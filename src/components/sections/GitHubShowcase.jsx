import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../common/SectionHeader.jsx';
import { Badge } from '../common/Badge.jsx';
import { siteConfig } from '../../config/siteConfig.js';
import { API_BASE } from '../../services/apiBase.js';

/**
 * GitHub Integration & Repositories Section
 * Fetches real public GitHub profile and repository metrics via the native backend.
 */
export function GitHubShowcase() {
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [isConfigured, setIsConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchGitHubData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile and repos in parallel from native backend endpoints
        const [profileRes, reposRes] = await Promise.all([
          fetch(`${API_BASE}/github/profile`),
          fetch(`${API_BASE}/github/repos`)
        ]);

        if (!profileRes.ok) {
          throw new Error(`Profile request returned HTTP ${profileRes.status}`);
        }
        if (!reposRes.ok) {
          throw new Error(`Repositories request returned HTTP ${reposRes.status}`);
        }

        const profileData = await profileRes.json();
        const reposData = await reposRes.json();

        if (!isMounted) return;

        // Check if username has not been configured yet
        if (profileData.configured === false || reposData.configured === false) {
          setIsConfigured(false);
          setLoading(false);
          return;
        }

        setIsConfigured(true);
        setProfile(profileData.profile);
        setRepos(reposData.repos || []);
      } catch (err) {
        if (!isMounted) return;
        console.warn('[GitHub Integration]', err.message);
        setError('GitHub information is currently unavailable. You can visit the public profile directly on GitHub.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchGitHubData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fallbackProfileUrl = siteConfig.github?.profileUrl || 'https://github.com';

  return (
    <section id="github" className="section" aria-label="GitHub Profile and Public Repositories">
      <div className="container">
        <SectionHeader
          eyebrow="Open Source"
          title="GitHub Activity & Repositories"
          description="Live public repositories and code contributions synchronized via the official public GitHub REST API."
        />

        {/* 1. Setup Placeholder State (When GitHub username is not yet configured) */}
        {!loading && !isConfigured && (
          <div className="github-setup-card">
            <div className="github-setup-icon-box" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </div>
            <div className="github-setup-body">
              <h3 className="github-setup-title">GitHub Integration Ready</h3>
              <p className="github-setup-text">
                The native backend REST proxy is active. Configure your username in{' '}
                <code>src/config/siteConfig.js</code> (under <code>github.username</code>) or set the{' '}
                <code>GITHUB_USERNAME</code> environment variable to automatically stream your live public repositories and metrics.
              </p>
              <div className="github-setup-actions">
                <a
                  href={fallbackProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <span>Visit GitHub Profile</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 2. Loading State */}
        {loading && (
          <div className="github-loading-state" aria-live="polite">
            <div className="skeleton-profile-card">
              <div className="skeleton-avatar" />
              <div className="skeleton-content">
                <div className="skeleton-line title" />
                <div className="skeleton-line subtitle" />
              </div>
            </div>
            <div className="repos-grid">
              {[1, 2, 3].map((n) => (
                <div key={n} className="skeleton-repo-card">
                  <div className="skeleton-line title" />
                  <div className="skeleton-line text" />
                  <div className="skeleton-line text short" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Error Fallback State */}
        {!loading && error && (
          <div className="github-error-card">
            <div className="github-error-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="github-error-body">
              <h4 className="github-error-title">GitHub Sync Unavailable</h4>
              <p className="github-error-text">{error}</p>
              <a
                href={fallbackProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <span>Direct GitHub Profile</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* 4. Active Live GitHub Data State */}
        {!loading && isConfigured && !error && profile && (
          <div className="github-live-content">
            {/* Profile Overview Card */}
            <div className="github-profile-card">
              <div className="github-profile-header">
                <img
                  src={profile.avatarUrl}
                  alt={`${profile.name} GitHub avatar`}
                  className="github-avatar"
                  loading="lazy"
                />
                <div className="github-profile-details">
                  <div className="github-name-row">
                    <h3 className="github-profile-name">{profile.name}</h3>
                    <Badge variant="primary">@{profile.username}</Badge>
                  </div>
                  {profile.bio && <p className="github-profile-bio">{profile.bio}</p>}
                </div>

                <div className="github-profile-cta">
                  <a
                    href={profile.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                    aria-label={`View ${profile.username} on GitHub`}
                  >
                    <span>View GitHub Profile</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="github-stats-row">
                <div className="github-stat-box">
                  <span className="github-stat-number">{profile.publicRepos}</span>
                  <span className="github-stat-label">Public Repositories</span>
                </div>
                <div className="github-stat-box">
                  <span className="github-stat-number">{profile.followers}</span>
                  <span className="github-stat-label">Followers</span>
                </div>
                <div className="github-stat-box">
                  <span className="github-stat-number">{profile.following}</span>
                  <span className="github-stat-label">Following</span>
                </div>
              </div>
            </div>

            {/* Public Repositories Grid */}
            <div className="github-repos-section">
              <h4 className="github-repos-heading">Featured Public Repositories</h4>

              {repos.length === 0 ? (
                <div className="github-empty-repos">
                  <p>No public repositories found for this account.</p>
                </div>
              ) : (
                <div className="repos-grid">
                  {repos.map((repo) => (
                    <article key={repo.id} className="repo-card">
                      <div className="repo-card-top">
                        <div className="repo-header">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                          </svg>
                          <h5 className="repo-name">{repo.name}</h5>
                        </div>

                        <p className="repo-description">
                          {repo.description || 'Public repository and code exploration.'}
                        </p>
                      </div>

                      <div className="repo-card-bottom">
                        <div className="repo-metrics">
                          <Badge variant="default">{repo.language}</Badge>
                          <span className="repo-metric-item" title="Stars">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <span>{repo.stars}</span>
                          </span>
                          <span className="repo-metric-item" title="Forks">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <line x1="6" y1="3" x2="6" y2="15" />
                              <circle cx="18" cy="6" r="3" />
                              <circle cx="6" cy="18" r="3" />
                              <path d="M18 9a9 9 0 0 1-9 9" />
                            </svg>
                            <span>{repo.forks}</span>
                          </span>
                        </div>

                        <a
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm repo-link-btn"
                          aria-label={`View ${repo.name} repository on GitHub`}
                        >
                          <span>View Repository</span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="7" y1="17" x2="17" y2="7" />
                            <polyline points="7 7 17 7 17 17" />
                          </svg>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
