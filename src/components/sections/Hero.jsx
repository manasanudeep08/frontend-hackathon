import React from 'react';
import { siteConfig } from '../../config/siteConfig.js';

export function Hero({ data = null } = {}) {
  const isCustom = Boolean(data);
  const { meta: defaultMeta, profileCard: defaultProfileCard } = siteConfig;

  const name = isCustom ? (data.fullName || data.name || 'Developer') : defaultMeta.name;
  const headline = isCustom ? (data.headline || defaultMeta.headline) : defaultMeta.headline;
  const heroLabel = isCustom ? 'Developer Portfolio' : defaultMeta.heroLabel;
  const heroDescription = isCustom
    ? (data.degree && data.institution ? `${data.degree} student at ${data.institution}` : (data.bioIntro || 'Software Development & Engineering'))
    : defaultMeta.heroDescription;
  const heroParagraph = isCustom ? (data.bioIntro || '') : defaultMeta.heroParagraph;
  const location = isCustom ? (data.location || 'Remote') : defaultProfileCard.location;
  const degree = isCustom ? (data.degree || 'Computer Science & Engineering') : defaultProfileCard.degree;
  const institution = isCustom ? (data.institution || 'University') : defaultProfileCard.institution;
  const academicPeriod = isCustom ? (data.academicPeriod || 'Present') : defaultProfileCard.academicPeriod;
  const interestsText = isCustom
    ? (Array.isArray(data.interests) && data.interests.length > 0 ? data.interests.join(' • ') : 'Software Development')
    : defaultProfileCard.interests;

  const githubUrl = isCustom ? (data.githubUrl || null) : 'https://github.com';
  const linkedinUrl = isCustom ? (data.linkedinUrl || null) : 'https://linkedin.com';
  const email = isCustom
    ? (data.showEmailPublicly && data.contactEmail ? data.contactEmail : null)
    : (siteConfig.contact.email || null);
  const hasProjects = isCustom ? Boolean(data.projects && data.projects.length > 0) : true;
  const resumeUrl = isCustom ? (data.resumeUrl || null) : defaultMeta.resumeUrl;

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 72;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  const currentStatusText = isCustom
    ? 'Available for opportunities & collaborations'
    : (defaultMeta.isAvailableForInternships
        ? (defaultMeta.statusAvailable || defaultMeta.status || 'Available for internships & collaborations')
        : (defaultMeta.statusUnavailable || defaultMeta.statusBusy || 'Focused on academics & coursework'));

  return (
    <section id="home" className="hero-section" aria-label="Introduction">
      <div className="container">
        <div className="hero-grid">
          {/* LEFT COLUMN: Narrative & Call to Actions */}
          <div className="hero-content">
            {/* Small Label */}
            <div className="hero-small-label">
              <span>{heroLabel}</span>
            </div>

            {/* Main Heading */}
            <h1 className="hero-main-heading">
              {name}
            </h1>

            {/* Professional Description */}
            <h2 className="hero-professional-desc">
              {isCustom && headline ? headline : heroDescription}
            </h2>

            {/* Supporting Paragraph */}
            {heroParagraph && (
              <p className="hero-supporting-paragraph">
                {heroParagraph}
              </p>
            )}

            {/* Action Buttons */}
            <div className="hero-btn-group">
              {hasProjects && (
                <a
                  href="#projects"
                  className="btn btn-primary"
                  onClick={(e) => handleSmoothScroll(e, 'projects')}
                >
                  <span>Explore Projects</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              )}

              {resumeUrl && (
                <a
                  href={resumeUrl}
                  className="btn btn-secondary"
                  download={`${name.toLowerCase()}-resume.pdf`}
                  aria-label="Download Resume in PDF format"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download Resume</span>
                </a>
              )}

              <a
                href="#contact"
                className="btn btn-secondary"
                onClick={(e) => handleSmoothScroll(e, 'contact')}
              >
                <span>Contact Me</span>
              </a>
            </div>

            {/* Social Links */}
            {(githubUrl || linkedinUrl || email) && (
              <div className="hero-socials-wrapper">
                <span className="hero-socials-label">Connect:</span>
                <div className="hero-socials-list" role="list">
                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-social-link"
                      aria-label="GitHub Profile"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span>GitHub</span>
                    </a>
                  )}

                  {linkedinUrl && (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hero-social-link"
                      aria-label="LinkedIn Profile"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                      </svg>
                      <span>LinkedIn</span>
                    </a>
                  )}

                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="hero-social-link"
                      aria-label={`Email ${name}`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <span>Email</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Profile Visual & Information Card */}
          <div className="hero-visual-column">
            <div className="profile-photo-wrapper">
              <div className="profile-photo-card" role="img" aria-label="Personal photograph placeholder">
                <div className="photo-placeholder-inner">
                  <div className="photo-placeholder-avatar">
                    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="photo-placeholder-meta">
                    <span className="photo-placeholder-title">{name}</span>
                    <span className="photo-placeholder-subtitle">{headline}</span>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="profile-status-badge">
                <span
                  className="pulse-indicator"
                  aria-hidden="true"
                  style={{
                    backgroundColor: 'var(--color-success)'
                  }}
                />
                <span className="status-badge-text">{currentStatusText}</span>
              </div>
            </div>

            {/* Minimal Profile Information Card */}
            <div className="profile-info-card">
              <div className="profile-info-row">
                <div className="profile-info-item">
                  <span className="profile-info-label">Degree</span>
                  <span className="profile-info-value">{degree}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Institution</span>
                  <span className="profile-info-value">{institution}</span>
                </div>
              </div>

              <div className="profile-info-divider" />

              <div className="profile-info-row">
                <div className="profile-info-item">
                  <span className="profile-info-label">Period</span>
                  <span className="profile-info-value">{academicPeriod}</span>
                </div>
                <div className="profile-info-item">
                  <span className="profile-info-label">Location</span>
                  <span className="profile-info-value">{location}</span>
                </div>
              </div>

              <div className="profile-info-divider" />

              <div className="profile-info-row" style={{ gridTemplateColumns: '1fr' }}>
                <div className="profile-info-item">
                  <span className="profile-info-label">Core Interests</span>
                  <span className="profile-info-value">{interestsText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
