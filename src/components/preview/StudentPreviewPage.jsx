import React, { useEffect, useState } from 'react';
import { getStudentPortfolio } from '../../services/portfolioApi.js';
import { PortfolioView } from '../portfolio/PortfolioView.jsx';
import { useRouter, Link } from '../../router/Router.jsx';

/**
 * Dedicated Preview Page for Authenticated Students (/preview)
 * Renders the full data-driven portfolio with isPreview=true banner.
 */
export function StudentPreviewPage() {
  const { navigate } = useRouter();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await getStudentPortfolio();
        if (isMounted) {
          setPortfolio(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load preview.');
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--accent-blue)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto var(--space-3)'
            }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Loading portfolio preview...
          </p>
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <div className="contact-card" style={{ maxWidth: '480px', textAlign: 'center', padding: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-2)', color: 'var(--text-primary)' }}>
            Unable to Load Preview
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }}>
            {error || 'Could not find your portfolio details.'}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <Link href="/dashboard" className="btn btn-secondary btn-sm">
              Dashboard
            </Link>
            <Link href="/builder" className="btn btn-primary btn-sm">
              Open Builder
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PortfolioView
      portfolioData={portfolio}
      isPreview={true}
      onEdit={() => navigate('/builder')}
    />
  );
}

export default StudentPreviewPage;
