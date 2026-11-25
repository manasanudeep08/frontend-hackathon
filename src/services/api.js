/**
 * Client-Side API Service
 * Handles communication with the native Node.js HTTP backend.
 */

const API_BASE = '/api';

/**
 * Submit contact form inquiry
 * @param {{ name: string, email: string, subject?: string, message: string, website_hp?: string }} payload
 * @returns {Promise<{ success: boolean, message: string, data?: object }>}
 */
export async function submitContactForm(payload) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
      const details = data?.error?.details || null;
      const error = new Error(errorMsg);
      error.details = details;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Connection timed out. Please check your network and try again.');
    }
    throw error;
  }
}

/**
 * Check backend health status
 */
export async function fetchHealthStatus() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
