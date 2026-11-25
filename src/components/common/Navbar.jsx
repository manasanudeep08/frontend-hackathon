import React, { useState, useEffect, useRef } from 'react';
import { siteConfig } from '../../config/siteConfig.js';

export function Navbar({ data = null, isDemo = false, isOwner = false } = {}) {
  const isCustom = Boolean(data);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const toggleBtnRef = useRef(null);

  const name = isCustom ? (data.fullName || data.username || 'Developer') : siteConfig.meta.name;
  const initials = isCustom
    ? (data.fullName || 'DV').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : siteConfig.meta.initials;

  const navLinks = isCustom
    ? [
        { label: 'Home', href: '#home' },
        ...(data.bioIntro || (data.interests && data.interests.length > 0) || data.institution
          ? [{ label: 'About', href: '#about' }]
          : []),
        ...(data.skills && data.skills.length > 0 ? [{ label: 'Skills', href: '#skills' }] : []),
        ...(data.projects && data.projects.length > 0 ? [{ label: 'Projects', href: '#projects' }] : []),
        { label: 'Contact', href: '#contact' }
      ]
    : siteConfig.navigation;

  const resumeUrl = isCustom ? (data.resumeUrl || null) : siteConfig.meta.resumeUrl;

  // Scrollspy to detect active section
  useEffect(() => {
    const sectionIds = navLinks.map((nav) => nav.href.replace('#', ''));

    const handleScroll = () => {
      const scrollPosition = window.scrollY + (isDemo || isOwner ? 180 : 140);

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const element = document.getElementById(id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks]);

  // Close mobile menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        if (toggleBtnRef.current) {
          toggleBtnRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Close mobile menu on click outside
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (e) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(e.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);

    if (element) {
      const headerOffset = isDemo || isOwner ? 114 : 72;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      window.history.pushState(null, '', href);
    }
  };

  return (
    <header className="navbar-wrapper">
      <div className="container">
        <div className="navbar-inner">
          {/* Monogram Logo */}
          <a
            href="#home"
            className="navbar-brand"
            onClick={(e) => handleNavClick(e, '#home')}
            aria-label={`${name} - Return to Top`}
          >
            <div className="brand-monogram">
              {initials}
            </div>
            <div className="brand-info">
              <span className="brand-name">{name}</span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="navbar-desktop-nav" aria-label="Main Navigation">
            <ul className="nav-list">
              {navLinks.map((item) => {
                const sectionId = item.href.replace('#', '');
                const isActive = activeSection === sectionId;

                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      onClick={(e) => handleNavClick(e, item.href)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions: Resume Download Button & Mobile Toggle */}
          <div className="navbar-actions">
            {resumeUrl && (
              <a
                href={resumeUrl}
                className="btn btn-outline-primary btn-sm resume-btn"
                download={`${name.toLowerCase()}-resume.pdf`}
                aria-label="Download Resume in PDF format"
              >
                <span>Download Resume</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            )}

            {/* Mobile Hamburger Button */}
            <button
              ref={toggleBtnRef}
              type="button"
              className="navbar-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
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
          id="mobile-navigation"
          ref={mobileMenuRef}
          className="navbar-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Drawer"
        >
          <div className="container">
            <ul className="mobile-nav-list">
              {navLinks.map((item) => {
                const sectionId = item.href.replace('#', '');
                const isActive = activeSection === sectionId;

                return (
                  <li key={item.href} className="mobile-nav-item">
                    <a
                      href={item.href}
                      className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                      onClick={(e) => handleNavClick(e, item.href)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>

            {resumeUrl && (
              <div className="mobile-drawer-footer">
                <a
                  href={resumeUrl}
                  className="btn btn-outline-primary btn-block"
                  download={`${name.toLowerCase()}-resume.pdf`}
                >
                  <span>Download Resume</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
