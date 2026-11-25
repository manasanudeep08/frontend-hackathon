import React, { useEffect, useState } from 'react';
import { getPublicPortfolio } from '../../services/portfolioApi.js';
import { PortfolioView } from './PortfolioView.jsx';
import { Link } from '../../router/Router.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Public Student Portfolio Page
 * Loaded for route /p/:username. Displays published student portfolios without requiring authentication.
 * Returns accessible 404 for drafts or nonexistent accounts.
 *
 * @param {{ username: string }} props
 */
export function PublicPortfolioPage({ username }) {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setNotFound(false);
    setErrorMessage('');

    async function loadPortfolio() {
      try {
        const data = await getPublicPortfolio(username);
        if (isMounted) {
          setPortfolio(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setNotFound(true);
          setErrorMessage(err.message || 'Portfolio not found or is currently unpublished.');
          setLoading(false);
        }
      }
    }

    if (username) {
      loadPortfolio();
    } else {
      setNotFound(true);
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [username]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-secondary)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
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
            Loading student portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !portfolio) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)'
        }}
      >
        <div
          className="contact-card"
          style={{
            maxWidth: '540px',
            width: '100%',
            textAlign: 'center',
            padding: 'var(--space-8)'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
              color: 'var(--text-secondary)'
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
            Portfolio Not Found
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-base)', lineHeight: '1.6', marginBottom: 'var(--space-6)' }}>
            The portfolio for <code>@{username}</code> does not exist or has not been published yet.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
            <Link href="/" className="btn btn-primary btn-sm">
              Platform Home
            </Link>
            <Link href="/demo" className="btn btn-secondary btn-sm">
              Explore Demo Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = Boolean(
    user &&
    user.role === 'student' &&
    user.username &&
    username &&
    user.username.trim().toLowerCase() === username.trim().toLowerCase()
  );

  return <PortfolioView portfolioData={portfolio} isPreview={false} isOwner={isOwner} />;
}
