import React from 'react';
import { siteConfig } from '../../config/siteConfig.js';
import { Link } from '../../router/Router.jsx';

export function Footer({ data = null, isDemo = false } = {}) {
  const currentYear = new Date().getFullYear();
  const author = data ? (data.fullName || data.username || 'Developer') : siteConfig.meta.author;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-left">
            <p className="footer-copyright">
              © {currentYear} {author}. All rights reserved.
            </p>
            <p className="footer-built-with">
              Built with React, Vite, and Native Node.js HTTP. Minimal light-mode design system.
            </p>
          </div>

          <div className="footer-right">
            {isDemo && (
              <Link href="/" className="exit-demo-link">
                <span>Exit Demo</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}
            <button
              type="button"
              className="scroll-top-btn"
              onClick={scrollToTop}
              aria-label="Scroll back to top"
            >
              <span>Back to Top</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
