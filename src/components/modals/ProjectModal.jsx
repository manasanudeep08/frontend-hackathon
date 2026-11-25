import React from 'react';
import { Modal } from '../common/Modal.jsx';
import { Badge } from '../common/Badge.jsx';

/**
 * Reusable & Accessible Project Case Study Modal
 * Displays all 11 structured case study fields from projects.js
 * 
 * @param {{
 *   project: object | null,
 *   isOpen: boolean,
 *   onClose: () => void
 * }} props
 */
export function ProjectModal({ project, isOpen, onClose }) {
  if (!project) return null;

  const caseStudy = project.caseStudy || null;

  // Icon for neutral screenshot placeholder
  const hasScreenshot = Boolean(caseStudy?.screenshot);
  const hasGithub = Boolean(project.githubUrl);
  const hasLiveDemo = Boolean(project.liveDemoUrl || project.liveUrl);
  const liveDemoLink = project.liveDemoUrl || project.liveUrl;

  const technologies = Array.isArray(project.technologies)
    ? project.technologies
    : typeof project.technologies === 'string'
      ? project.technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project.fullName || project.title || project.name}
      subtitle={`${project.category || 'Project'} • Overview & Details`}
      footer={
        <div className="modal-actions-footer">
          <div className="modal-external-links">
            {hasGithub && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub Repository</span>
              </a>
            )}

            {hasLiveDemo && (
              <a
                href={liveDemoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>Live Demonstration</span>
              </a>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      }
    >
      <div className="case-study-content">
        {/* Screenshot or Clean Neutral Placeholder */}
        <div className="case-study-visual-wrapper">
          {hasScreenshot ? (
            <img
              src={caseStudy.screenshot}
              alt={`${project.title || project.name} screenshot`}
              className="case-study-image"
            />
          ) : (
            <div className="case-study-placeholder" role="img" aria-label={`${project.title || project.name} interface preview placeholder`}>
              <div className="placeholder-icon-box">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <div className="placeholder-text-box">
                <span className="placeholder-title">{project.title || project.name} Preview</span>
                <span className="placeholder-note">Neutral display placeholder</span>
              </div>
            </div>
          )}
        </div>

        {/* Category & Status Banner */}
        <div className="case-study-meta-banner">
          <div className="meta-banner-item">
            <span className="meta-banner-label">Category</span>
            <span className="meta-banner-value">{project.category || 'Software Development'}</span>
          </div>
          {project.filterCategory && (
            <div className="meta-banner-item">
              <span className="meta-banner-label">Domain</span>
              <span className="meta-banner-value">{project.filterCategory}</span>
            </div>
          )}
        </div>

        {/* Project Overview */}
        <section className="case-study-block">
          <h4 className="case-study-block-heading">Project Overview</h4>
          <p className="case-study-body-text">{caseStudy?.overview || project.description}</p>
        </section>

        {/* Extended Case Study Details if present (original 6 projects) */}
        {caseStudy && (
          <>
            <div className="case-study-split-grid">
              {caseStudy.problemStatement && (
                <section className="case-study-block split-item">
                  <h4 className="case-study-block-heading">Problem Statement</h4>
                  <p className="case-study-body-text">{caseStudy.problemStatement}</p>
                </section>
              )}

              {caseStudy.proposedSolution && (
                <section className="case-study-block split-item">
                  <h4 className="case-study-block-heading">Proposed Solution</h4>
                  <p className="case-study-body-text">{caseStudy.proposedSolution}</p>
                </section>
              )}
            </div>

            {caseStudy.implementedFeatures && (
              <section className="case-study-block">
                <h4 className="case-study-block-heading">Key Features</h4>
                <div className="features-distinction-grid">
                  <div className="features-column implemented">
                    <div className="features-column-header">
                      <span className="features-status-dot green" aria-hidden="true" />
                      <h5 className="features-column-title">Implemented Capabilities</h5>
                    </div>
                    <ul className="features-list">
                      {caseStudy.implementedFeatures.map((feat, i) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  </div>

                  {caseStudy.plannedFeatures && caseStudy.plannedFeatures.length > 0 && (
                    <div className="features-column planned">
                      <div className="features-column-header">
                        <span className="features-status-dot blue" aria-hidden="true" />
                        <h5 className="features-column-title">Planned & Future Scope</h5>
                      </div>
                      <ul className="features-list">
                        {caseStudy.plannedFeatures.map((feat, i) => (
                          <li key={i}>{feat}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {/* Technologies Used */}
        {technologies.length > 0 && (
          <section className="case-study-block">
            <h4 className="case-study-block-heading">Technologies Used</h4>
            <div className="timeline-tech-stack" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {technologies.map((tech) => (
                <Badge key={tech} variant="primary">
                  {tech}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {caseStudy?.developmentProcess && (
          <section className="case-study-block">
            <h4 className="case-study-block-heading">Development Process</h4>
            <p className="case-study-body-text">{caseStudy.developmentProcess}</p>
          </section>
        )}

        {caseStudy?.challengesEncountered && (
          <section className="case-study-block">
            <h4 className="case-study-block-heading">Challenges Encountered</h4>
            <p className="case-study-body-text">{caseStudy.challengesEncountered}</p>
          </section>
        )}
      </div>
    </Modal>
  );
}
