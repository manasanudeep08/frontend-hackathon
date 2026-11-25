import React from 'react';
import { SectionHeader } from '../common/SectionHeader.jsx';
import { Badge } from '../common/Badge.jsx';
import { profileData } from '../../data/profile.js';

export function About({ data = null } = {}) {
  const isCustom = Boolean(data);
  const { about: defaultAbout } = profileData;

  const introParagraphs = isCustom
    ? (data.bioIntro ? [data.bioIntro] : ['Software development and computer science enthusiast passionate about building reliable software.'])
    : defaultAbout.intro;

  const interests = isCustom ? (data.interests || []) : defaultAbout.academicCard.interests;

  const academicName = isCustom ? (data.fullName || 'Student') : defaultAbout.academicCard.name;
  const academicDegree = isCustom ? (data.degree || 'Computer Science & Engineering') : defaultAbout.academicCard.degree;
  const academicInstitution = isCustom ? (data.institution || 'University') : defaultAbout.academicCard.institution;
  const academicPeriod = isCustom ? (data.academicPeriod || 'Present') : defaultAbout.academicCard.period;
  const academicLocation = isCustom ? (data.location || 'Remote') : defaultAbout.academicCard.location;

  return (
    <section id="about" className="section section-alt" aria-label="About Me">
      <div className="container">
        <SectionHeader
          eyebrow="BACKGROUND"
          title={isCustom ? `About ${data.fullName || 'Me'}` : defaultAbout.title}
          description={isCustom ? (data.headline || 'Education and technical areas of focus') : defaultAbout.description}
        />

        <div className="about-two-column-grid">
          {/* LEFT COLUMN: Personal Narrative */}
          <div className="about-narrative-col">
            <div className="about-text-blocks">
              {introParagraphs.map((paragraph, index) => (
                <p key={index} className="about-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Core Focus Pills */}
            {interests.length > 0 && (
              <div className="about-focus-wrapper">
                <span className="about-focus-title">Primary Focus Areas:</span>
                <div className="about-focus-tags">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="primary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Academic Information Card */}
          <div className="about-academic-col">
            <div className="academic-info-card">
              <div className="academic-card-header">
                <div className="academic-badge-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div className="academic-header-text">
                  <h3 className="academic-card-title">Academic Profile</h3>
                  <span className="academic-card-subtitle">{academicInstitution}</span>
                </div>
              </div>

              <div className="academic-card-body">
                <div className="academic-info-row">
                  <span className="academic-label">Name</span>
                  <span className="academic-val">{academicName}</span>
                </div>

                <div className="academic-info-row">
                  <span className="academic-label">Degree</span>
                  <span className="academic-val font-semibold">{academicDegree}</span>
                </div>

                <div className="academic-info-row">
                  <span className="academic-label">Institution</span>
                  <span className="academic-val">{academicInstitution}</span>
                </div>

                <div className="academic-info-row">
                  <span className="academic-label">Academic Period</span>
                  <span className="academic-val">{academicPeriod}</span>
                </div>

                <div className="academic-info-row">
                  <span className="academic-label">Location</span>
                  <span className="academic-val">{academicLocation}</span>
                </div>

                <div className="academic-card-divider" />

                <div className="academic-status-wrapper">
                  <div className="academic-status-indicator">
                    <span className="pulse-indicator" aria-hidden="true" style={{ backgroundColor: 'var(--color-success)' }} />
                    <span className="academic-status-text">Active Degree Program</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
