import { sendJson, sendError } from '../utils/response.js';
import { siteConfig } from '../../src/config/siteConfig.js';

// In-memory caching for GitHub API responses to prevent rate-limit exhaustion
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

// GitHub username format: Alphanumeric with single hyphens, max 39 characters
const GITHUB_USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/**
 * Clear in-memory cache (primarily used in automated tests)
 */
export function clearGitHubCache() {
  cache.clear();
}

/**
 * Get item from cache if unexpired
 * @param {string} key
 */
function getFromCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

/**
 * Store item in cache with timestamp
 * @param {string} key
 * @param {any} data
 */
function setInCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Resolve active GitHub username from request query or configuration
 * @param {import('node:http').IncomingMessage} req
 * @returns {string}
 */
export function resolveUsername(req) {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    const queryUser = url.searchParams.get('username');
    if (queryUser && typeof queryUser === 'string') {
      return queryUser.trim();
    }
  } catch {
    // Fall back to config if URL parsing fails
  }

  const envUser = process.env.GITHUB_USERNAME;
  const configUser = siteConfig.github && siteConfig.github.username;

  return (envUser || configUser || '').trim();
}

/**
 * Fetch from public GitHub REST API with timeout and secure headers
 * @param {string} endpoint
 * @returns {Promise<{ ok: boolean, status: number, data?: any, error?: string }>}
 */
async function fetchFromGitHub(endpoint) {
  const url = `https://api.github.com${endpoint}`;
  const headers = {
    'User-Agent': 'Portfolio-Native-Node-Server/1.0',
    'Accept': 'application/vnd.github.v3+json'
  };

  // Optional token support for elevated rate limits (never exposed to client)
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6500);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.status === 404) {
      return { ok: false, status: 404, error: 'GitHub resource not found' };
    }

    if (response.status === 403 || response.status === 429) {
      return { ok: false, status: 429, error: 'GitHub API rate limit exceeded. Please try again later.' };
    }

    if (!response.ok) {
      return { ok: false, status: response.status, error: `GitHub API error (${response.status})` };
    }

    const data = await response.json();
    return { ok: true, status: 200, data };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { ok: false, status: 504, error: 'GitHub API connection timed out' };
    }
    return { ok: false, status: 502, error: 'Unable to connect to GitHub API at this time' };
  }
}

/**
 * Handle GET /api/github/profile
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
export async function handleGitHubProfile(req, res) {
  const username = resolveUsername(req);

  // If no username is configured, return setup placeholder indicator
  if (!username) {
    return sendJson(res, 200, {
      success: true,
      configured: false,
      message: 'GitHub username is not configured. Set github.username in src/config/siteConfig.js or GITHUB_USERNAME environment variable.',
      profile: null
    });
  }

  // Validate username format
  if (!GITHUB_USERNAME_REGEX.test(username)) {
    return sendError(res, 400, 'Invalid GitHub username format. Usernames may only contain alphanumeric characters and single hyphens.');
  }

  // Check cache
  const cacheKey = `profile:${username.toLowerCase()}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return sendJson(res, 200, {
      success: true,
      configured: true,
      cached: true,
      profile: cachedData
    });
  }

  const result = await fetchFromGitHub(`/users/${encodeURIComponent(username)}`);

  if (!result.ok) {
    return sendError(res, result.status, result.error);
  }

  const u = result.data;
  const profile = {
    username: u.login,
    name: u.name || u.login,
    avatarUrl: u.avatar_url,
    bio: u.bio || null,
    location: u.location || null,
    company: u.company || null,
    blog: u.blog || null,
    publicRepos: typeof u.public_repos === 'number' ? u.public_repos : 0,
    followers: typeof u.followers === 'number' ? u.followers : 0,
    following: typeof u.following === 'number' ? u.following : 0,
    profileUrl: u.html_url || `https://github.com/${username}`,
    createdAt: u.created_at
  };

  setInCache(cacheKey, profile);

  return sendJson(res, 200, {
    success: true,
    configured: true,
    cached: false,
    profile
  });
}

/**
 * Handle GET /api/github/repos
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
export async function handleGitHubRepos(req, res) {
  const username = resolveUsername(req);

  // If unconfigured, return clean setup status
  if (!username) {
    return sendJson(res, 200, {
      success: true,
      configured: false,
      message: 'GitHub username is not configured.',
      count: 0,
      repos: []
    });
  }

  // Validate username format
  if (!GITHUB_USERNAME_REGEX.test(username)) {
    return sendError(res, 400, 'Invalid GitHub username format.');
  }

  const cacheKey = `repos:${username.toLowerCase()}`;
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return sendJson(res, 200, {
      success: true,
      configured: true,
      cached: true,
      count: cachedData.length,
      repos: cachedData
    });
  }

  const perPage = siteConfig.github?.showPublicRepos || 6;
  const result = await fetchFromGitHub(`/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${perPage}`);

  if (!result.ok) {
    return sendError(res, result.status, result.error);
  }

  const repos = Array.isArray(result.data) ? result.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description || null,
    language: repo.language || 'Plain Text',
    stars: typeof repo.stargazers_count === 'number' ? repo.stargazers_count : 0,
    forks: typeof repo.forks_count === 'number' ? repo.forks_count : 0,
    url: repo.html_url,
    homepage: repo.homepage || null,
    updatedAt: repo.updated_at,
    isFork: Boolean(repo.fork)
  })) : [];

  setInCache(cacheKey, repos);

  return sendJson(res, 200, {
    success: true,
    configured: true,
    cached: false,
    count: repos.length,
    repos
  });
}
