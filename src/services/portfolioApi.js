/**
 * Student and Public Portfolio API Service
 * Interacts with /api/student/portfolio and /api/p/:username
 */

const API_BASE = '/api';

/**
 * Fetch the authenticated student's portfolio.
 * @returns {Promise<object>}
 */
export async function getStudentPortfolio() {
  const response = await fetch(`${API_BASE}/student/portfolio`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json'
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || `Failed to fetch portfolio (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    throw error;
  }
  return data.portfolio;
}

/**
 * Update the authenticated student's portfolio.
 * @param {object} payload Whitelisted fields
 * @param {string} csrfToken CSRF token
 * @returns {Promise<object>}
 */
export async function updateStudentPortfolio(payload, csrfToken) {
  const response = await fetch(`${API_BASE}/student/portfolio`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-Token': csrfToken || ''
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || `Failed to save portfolio (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    throw error;
  }
  return data;
}

/**
 * Publish the authenticated student's portfolio.
 * @param {string} csrfToken
 * @returns {Promise<object>}
 */
export async function publishStudentPortfolio(csrfToken) {
  const response = await fetch(`${API_BASE}/student/portfolio/publish`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-Token': csrfToken || ''
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || `Failed to publish portfolio (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    throw error;
  }
  return data;
}

/**
 * Unpublish the authenticated student's portfolio (convert to draft).
 * @param {string} csrfToken
 * @returns {Promise<object>}
 */
export async function unpublishStudentPortfolio(csrfToken) {
  const response = await fetch(`${API_BASE}/student/portfolio/unpublish`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-Token': csrfToken || ''
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || `Failed to unpublish portfolio (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    throw error;
  }
  return data;
}

/**
 * Fetch a published portfolio by username slug.
 * @param {string} username
 * @returns {Promise<object>}
 */
export async function getPublicPortfolio(username) {
  const response = await fetch(`${API_BASE}/p/${encodeURIComponent(username)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data?.error?.message || data?.message || `Portfolio not found (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    throw error;
  }
  return data.portfolio;
}
