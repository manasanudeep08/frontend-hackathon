import React, { useState } from 'react';
import { Link } from '../../router/Router.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function PlatformHome() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="platform-home-wrapper">
      {/* Platform Header */}
      <header className="navbar-wrapper">
        <div className="container">
          <div className="navbar-inner">
            <Link href="/" className="navbar-brand">
              <span className="brand-monogram">P</span>
              <span className="brand-name">Personal Portfolio Website</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="navbar-desktop-nav" aria-label="Platform Navigation">
              <ul className="nav-links-list">
                <li>
                  <Link href="/demo" className="nav-link">
                    Demo Portfolio
                  </Link>
                </li>
                {user ? (
                  <>
                    <li>
                      <Link
                        href={user.role === 'admin' ? '/admin' : '/dashboard'}
                        className="nav-link"
                        style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--accent-blue)' }}
                      >
                        {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={logout}
                        className="btn btn-secondary btn-sm"
                        style={{ marginLeft: 'var(--space-2)' }}
                      >
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/login" className="nav-link">
                        Student Sign In
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/login" className="nav-link" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        Admin Login
                      </Link>
                    </li>
                    <li>
                      <Link href="/register" className="btn btn-primary btn-sm" style={{ marginLeft: 'var(--space-2)' }}>
                        Create Portfolio
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>

            {/* Mobile Hamburger Button */}
            <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                className="navbar-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="platform-mobile-nav"
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {mobileMenuOpen ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-Down Drawer */}
        {mobileMenuOpen && (
          <div
            id="platform-mobile-nav"
            className="navbar-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Platform Mobile Navigation"
          >
            <div className="container" style={{ padding: 'var(--space-4) 0' }}>
              <ul className="mobile-nav-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <li>
                  <Link href="/demo" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                    Demo Portfolio
                  </Link>
                </li>
                {user ? (
                  <>
                    <li>
                      <Link
                        href={user.role === 'admin' ? '/admin' : '/dashboard'}
                        className="nav-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="btn btn-secondary btn-block"
                        style={{ marginTop: 'var(--space-2)' }}
                      >
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                        Student Sign In
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                        Admin Login
                      </Link>
                    </li>
                    <li style={{ marginTop: 'var(--space-2)' }}>
                      <Link href="/register" className="btn btn-primary btn-block" onClick={() => setMobileMenuOpen(false)}>
                        Create Portfolio
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </header>

      {/* Main Hero & Portals */}
      <main>
        <section className="hero-section" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
          <div className="container">
            <div className="platform-hero-container">
              <div className="platform-badge-pill">
                <span>Multi-User Developer Platform</span>
              </div>

              <h1 className="platform-hero-title">
                Build & Share Your Personal Developer Portfolio
              </h1>

              <p className="platform-hero-subtext">
                A high-performance portfolio builder engineered with pure web standards and minimal light-mode aesthetics. Create, showcase, and publish your verified developer projects in five minutes.
              </p>

              {/* Primary Call to Actions */}
              <div className="hero-btn-group" style={{ justifyContent: 'center', marginBottom: 'var(--space-10)' }}>
                {user ? (
                  <Link
                    href={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className="btn btn-primary btn-lg"
                  >
                    Go to {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'} →
                  </Link>
                ) : (
                  <>
                    <Link href="/register" className="btn btn-primary btn-lg">
                      <span>Create Portfolio</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                    <Link href="/login" className="btn btn-secondary btn-lg">
                      Student Sign In
                    </Link>
                  </>
                )}
                <Link href="/demo" className="btn btn-outline-primary btn-lg">
                  View Demo Portfolio
                </Link>
              </div>

              {/* Four Clearly Distinguished Portal Cards */}
              <div className="platform-actions-grid" aria-label="Quick Access Portals">
                {/* 1. Create Portfolio */}
                <Link href="/register" className="portal-card portal-card-primary">
                  <div>
                    <div className="portal-card-icon" style={{ backgroundColor: 'var(--accent-blue-light)', color: 'var(--accent-blue)' }}>
                      🚀
                    </div>
                    <div className="portal-card-title">Create Portfolio</div>
                    <p className="portal-card-desc">
                      New student? Set up your verified portfolio in 5 minutes with our step-by-step guided builder.
                    </p>
                  </div>
                  <div className="portal-card-btn">
                    <span>Get Started</span>
                    <span>→</span>
                  </div>
                </Link>

                {/* 2. Student Login */}
                <Link href="/login" className="portal-card">
                  <div>
                    <div className="portal-card-icon" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                      👤
                    </div>
                    <div className="portal-card-title">Student Sign In</div>
                    <p className="portal-card-desc">
                      Already registered? Access your student dashboard, edit details, and manage publishing.
                    </p>
                  </div>
                  <div className="portal-card-btn" style={{ color: '#16A34A' }}>
                    <span>Sign In</span>
                    <span>→</span>
                  </div>
                </Link>

                {/* 3. Demo Portfolio */}
                <Link href="/demo" className="portal-card">
                  <div>
                    <div className="portal-card-icon" style={{ backgroundColor: '#FAF5FF', color: '#9333EA' }}>
                      🌐
                    </div>
                    <div className="portal-card-title">Demo Portfolio</div>
                    <p className="portal-card-desc">
                      Recruiter or visitor? Explore the reference light-mode template and inspect verified case studies.
                    </p>
                  </div>
                  <div className="portal-card-btn" style={{ color: '#9333EA' }}>
                    <span>Explore Demo</span>
                    <span>→</span>
                  </div>
                </Link>

                {/* 4. Admin Login */}
                <Link href="/admin/login" className="portal-card">
                  <div>
                    <div className="portal-card-icon" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                      🛡️
                    </div>
                    <div className="portal-card-title">Admin Login</div>
                    <p className="portal-card-desc">
                      Authorized platform administrator? Manage student accounts, portfolios, and system status.
                    </p>
                  </div>
                  <div className="portal-card-btn" style={{ color: 'var(--text-primary)' }}>
                    <span>Admin Portal</span>
                    <span>→</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="section section-alt">
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto var(--space-12)' }}>
              <h2 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-3)' }}>
                Designed for Students & Software Developers
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Every student receives a clean, accessible portfolio powered by our established design architecture.
              </p>
            </div>

            <div className="platform-features-grid">
              <div className="feature-card">
                <div className="feature-card-icon">⚡</div>
                <h3 className="feature-card-title">5-Minute Setup</h3>
                <p className="feature-card-desc">
                  A clean four-step builder guides you through basic information, visual interest selection, skills chips, and projects.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-card-icon">🎨</div>
                <h3 className="feature-card-title">Proven Design System</h3>
                <p className="feature-card-desc">
                  Your portfolio uses our verified minimal light-mode interface with zero external bloat, fast load times, and responsive stability.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-card-icon">🔒</div>
                <h3 className="feature-card-title">Persistent & Secure</h3>
                <p className="feature-card-desc">
                  Accounts and portfolios persist safely in a native JSON data store with scrypt password hashing, HttpOnly cookies, and strict isolation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Platform Footer */}
      <footer className="footer-wrapper" style={{ borderTop: '1px solid var(--border-color)', padding: 'var(--space-8) 0', backgroundColor: 'var(--bg-main)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} Personal Portfolio Website. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', alignItems: 'center' }}>
            <Link href="/demo" style={{ color: 'var(--text-secondary)' }}>
              Demo Portfolio
            </Link>
            <Link href="/login" style={{ color: 'var(--text-secondary)' }}>
              Student Login
            </Link>
            <Link href="/register" style={{ color: 'var(--text-secondary)' }}>
              Create Account
            </Link>
            <Link href="/admin/login" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
              Admin Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
