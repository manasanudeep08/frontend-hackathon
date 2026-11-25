import React from 'react';
import { SectionHeader } from '../common/SectionHeader.jsx';
import { Badge } from '../common/Badge.jsx';
import { developmentJourneyData } from '../../data/experience.js';

/**
 * Experience & Development Journey Section
 * Vertical timeline showcasing independent software projects and technical milestones.
 */
export function Experience() {
  return (
    <section id="experience" className="section" aria-label="Development Journey and Experience">
      <div className="container">
        <SectionHeader
          eyebrow="Development Journey"
          title="Experience & Technical Milestones"
          description="A structured timeline of my self-directed and academic software projects, exploring desktop tools, browser extensions, automation, and analytics."
        />

        <div className="experience-timeline-wrapper">
          {developmentJourneyData.map((item, index) => (
            <div key={item.id} className="experience-timeline-item">
              <div className="timeline-marker" aria-hidden="true">
                <span className="marker-index">{index + 1}</span>
              </div>

              <article className="timeline-card">
                <header className="timeline-header">
                  <div className="timeline-title-row">
                    <h3 className="timeline-role">{item.name}</h3>
                    <Badge variant="primary">{item.category}</Badge>
                  </div>
                  <span className="timeline-tagline">{item.tagline}</span>
                </header>

                <p className="timeline-description">{item.shortDescription}</p>

                <div className="timeline-milestones-block">
                  <h4 className="milestones-heading">Development Milestones</h4>
                  <ul className="timeline-highlights">
                    {item.milestones.map((milestone, idx) => (
                      <li key={idx}>{milestone}</li>
                    ))}
                  </ul>
                </div>

                <div className="timeline-tech-stack">
                  {item.technologies.map((tech) => (
                    <Badge key={tech} variant="default">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </article>
            </div>
          ))}
        </div>

        <div className="timeline-context-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Projects above represent self-directed, open-source, and academic software engineering implementations.</span>
        </div>
      </div>
    </section>
  );
}
