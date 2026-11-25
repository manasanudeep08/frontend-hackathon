import React from 'react';
import { SectionHeader } from '../common/SectionHeader.jsx';
import { Badge } from '../common/Badge.jsx';
import { educationData } from '../../data/education.js';

export function Education() {
  const { header, academicTimeline, reusableCategories } = educationData;

  return (
    <section id="education" className="section section-alt" aria-label="Education and Academic Journey">
      <div className="container">
        <SectionHeader
          eyebrow={header.eyebrow}
          title={header.title}
          description={header.description}
        />

        {/* Minimal Academic Timeline */}
        <div className="education-timeline-wrapper">
          {academicTimeline.map((item) => (
            <div key={item.id} className="education-timeline-item">
              <div className="education-card">
                <header className="education-card-header">
                  <div className="education-title-group">
                    <span className="education-institution-badge">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                      {item.institution}
                    </span>
                    <h3 className="education-degree-title">{item.degree}</h3>
                    <span className="education-location-text">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {item.location}
                    </span>
                  </div>

                  <div className="education-meta-badges">
                    <span className="education-period-badge">{item.period}</span>
                    <Badge variant="success">{item.status}</Badge>
                  </div>
                </header>

                <p className="education-overview-text">{item.overview}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reusable Space for Future Certifications, Workshops & Milestones */}
        <div className="education-reusable-spaces">
          <div className="reusable-section-intro">
            <h3 className="reusable-section-title">Certifications, Workshops & Milestones</h3>
            <p className="reusable-section-desc">
              Modular architecture reserved for verified technical certifications, workshops, and future academic achievements.
            </p>
          </div>

          <div className="reusable-spaces-grid">
            {reusableCategories.map((category) => (
              <div key={category.id} className="reusable-milestone-card">
                <div className="milestone-card-top">
                  <h4 className="milestone-card-title">{category.title}</h4>
                  <span className="milestone-notice-pill">{category.statusNotice}</span>
                </div>
                <p className="milestone-card-desc">{category.description}</p>
                <div className="milestone-placeholder-box">
                  <span className="milestone-placeholder-text">
                    {category.emptyNotice}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
