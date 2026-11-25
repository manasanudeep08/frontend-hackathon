import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRouter, Link } from '../../router/Router.jsx';
import {
  getStudentPortfolio,
  publishStudentPortfolio,
  unpublishStudentPortfolio
} from '../../services/portfolioApi.js';

/**
 * Calculates portfolio completion percentage based on core sections.
 * @param {object} p Portfolio record
 * @returns {number} 0 - 100
 */
function calculateCompletion(p) {
  if (!p) return 0;
  let score = 0;
  // Full Name: 15%
  if (p.fullName && p.fullName.trim().length >= 2) score += 15;
  // Professional Headline: 15%
  if (p.headline && p.headline.trim().length >= 3) score += 15;
  // Bio / About: 15%
  if (p.bioIntro && p.bioIntro.trim().length >= 10) score += 15;
  // Education (Degree or Institution): 15%
  if ((p.degree && p.degree.trim()) || (p.institution && p.institution.trim())) score += 15;
  // Interests (at least 1): 15%
  if (Array.isArray(p.interests) && p.interests.length > 0) score += 15;
  // Technical Skills (at least 1): 15%
  if (Array.isArray(p.skills) && p.skills.length > 0) score += 15;
  // Featured Projects (at least 1): 10%
  if (Array.isArray(p.projects) && p.projects.length > 0) score += 10;
  return Math.min(100, score);
}

export function StudentDashboard() {
  const { user, csrfToken, logout } = useAuth();
  const { navigate } = useRouter();

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const data = await getStudentPortfolio();
      setPortfolio(data);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Unable to load your portfolio details.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleTogglePublish = async () => {
    if (!portfolio) return;
    setStatusMessage(null);
    setActionLoading(true);

    try {
      if (portfolio.isPublished) {
        // Unpublish
        await unpublishStudentPortfolio(csrfToken);
        setPortfolio((prev) => ({ ...prev, isPublished: false }));
        setStatusMessage({
          type: 'success',
          text: 'Your portfolio has been unpublished and returned to draft mode.'
        });
      } else {
        // Publish
        await publishStudentPortfolio(csrfToken);
        setPortfolio((prev) => ({ ...prev, isPublished: true }));
        setStatusMessage({
          type: 'success',
          text: 'Congratulations! Your portfolio is now live for employers and the public.'
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update publishing status.'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const completion = calculateCompletion(portfolio);
  const username = user?.username || portfolio?.username || '';
  const publicUrl = `/p/${username}`;

  return (
    <div className="dashboard-wrapper" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Top Navigation */}
      <header className="navbar-wrapper">
        <div className="container">
          <div className="navbar-inner">
            <Link href="/dashboard" className="navbar-brand">
              <span className="brand-monogram">P</span>
              <span className="brand-name">Student Dashboard</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Signed in as <strong>@{username}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ maxWidth: '960px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        {/* Status notification */}
        {statusMessage && (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-6)',
              backgroundColor: statusMessage.type === 'error' ? 'var(--color-error-bg)' : 'var(--color-success-bg)',
              border: `1px solid ${statusMessage.type === 'error' ? 'var(--color-error-border)' : 'var(--color-success-border)'}`,
              color: statusMessage.type === 'error' ? 'var(--color-error)' : 'var(--color-success)',
              fontSize: 'var(--font-size-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{statusMessage.type === 'error' ? '⚠️' : '✓'}</span>
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              aria-label="Dismiss notification"
              style={{
                background: 'none',
                border: 'none',
                color: 'currentColor',
                cursor: 'pointer',
                fontWeight: 'bold',
                padding: '0 var(--space-2)'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--border-color)',
                borderTopColor: 'var(--accent-blue)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto var(--space-4)'
              }}
            />
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Loading your portfolio data...
            </p>
          </div>
        ) : (
          <>
            {/* Header / Welcome Card */}
            <div className="dashboard-user-card">
              <div className="dashboard-user-header">
                <div className="dashboard-user-profile">
                  <div className="dashboard-avatar-circle">
                    {(portfolio?.fullName || user?.fullName || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--text-primary)', margin: 0, fontWeight: 'var(--font-weight-bold)' }}>
                      Welcome, {portfolio?.fullName || user?.fullName || 'Student'}!
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px', margin: 0 }}>
                      {portfolio?.headline || 'Aspiring Software Developer'}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  <span className={`badge-status ${portfolio?.isPublished ? 'badge-published' : 'badge-draft'}`}>
                    <span className={`badge-dot ${portfolio?.isPublished ? 'badge-dot-green' : 'badge-dot-amber'}`} />
                    {portfolio?.isPublished ? 'Live & Published' : 'Draft Mode'}
                  </span>
                </div>
              </div>

              {/* Completion Progress Bar */}
              <div className="dashboard-completion-wrapper">
                <div className="dashboard-completion-meta">
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                    Portfolio Completion: {completion}%
                  </span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                    {completion === 100 ? '✓ Ready for recruiter review' : 'Complete recommended fields to stand out'}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={completion}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label="Portfolio Completion Progress"
                  className="dashboard-completion-bar-track"
                >
                  <div
                    className={`dashboard-completion-bar-fill ${completion === 100 ? 'is-complete' : ''}`}
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="dashboard-stats-grid">
              <div className="dashboard-stat-card">
                <div>
                  <div className="dashboard-stat-label">
                    Selected Interests
                  </div>
                  <div className="dashboard-stat-value">
                    {portfolio?.interests?.length || 0}
                  </div>
                </div>
                <div className="dashboard-stat-desc">
                  {portfolio?.interests?.length ? portfolio.interests.slice(0, 3).join(', ') + (portfolio.interests.length > 3 ? '...' : '') : 'No focus areas chosen yet'}
                </div>
              </div>

              <div className="dashboard-stat-card">
                <div>
                  <div className="dashboard-stat-label">
                    Skills Showcase
                  </div>
                  <div className="dashboard-stat-value">
                    {portfolio?.skills?.length || 0}
                  </div>
                </div>
                <div className="dashboard-stat-desc">
                  {portfolio?.skills?.length ? `${portfolio.skills.length} verified technical proficiencies` : 'Add technical skills in builder'}
                </div>
              </div>

              <div className="dashboard-stat-card">
                <div>
                  <div className="dashboard-stat-label">
                    Featured Projects
                  </div>
                  <div className="dashboard-stat-value">
                    {portfolio?.projects?.length || 0}
                  </div>
                </div>
                <div className="dashboard-stat-desc">
                  {portfolio?.projects?.length ? `${portfolio.projects.length} project case studies listed` : 'Add real projects you have built'}
                </div>
              </div>

              <div className="dashboard-stat-card">
                <div>
                  <div className="dashboard-stat-label">
                    Public URL Slug
                  </div>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: 'var(--space-2)', wordBreak: 'break-all' }}>
                    <code>/p/{username}</code>
                  </div>
                </div>
                <div className="dashboard-stat-desc">
                  {portfolio?.isPublished ? 'Publicly visible to employers' : 'Publish to make portfolio live'}
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="dashboard-actions-card">
              <h2 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)', margin: 0, fontWeight: 'var(--font-weight-bold)' }}>
                Portfolio Actions
              </h2>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Open the guided 5-minute builder, review your live preview, or toggle publishing visibility.
              </p>

              <div className="dashboard-actions-group">
                <Link
                  href="/builder"
                  className="btn btn-primary"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  <span>Open 5-Minute Builder</span>
                </Link>

                <Link
                  href="/preview"
                  className="btn btn-secondary"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span>Preview Portfolio</span>
                </Link>

                {portfolio?.isPublished && (
                  <Link
                    href={publicUrl}
                    className="btn btn-secondary"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    <span>View Live Portfolio</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleTogglePublish}
                  disabled={actionLoading}
                  className={portfolio?.isPublished ? 'btn btn-danger' : 'btn btn-success'}
                >
                  {actionLoading ? 'Updating...' : portfolio?.isPublished ? 'Unpublish to Draft' : 'Publish Portfolio'}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;
