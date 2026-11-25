import React, { useState } from 'react';
import { SectionHeader } from '../common/SectionHeader.jsx';
import { Badge } from '../common/Badge.jsx';
import { projectsData, projectFilterTabs } from '../../data/projects.js';

function getCategoryIcon(filterCategory) {
  switch (filterCategory) {
    case 'Desktop Applications':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case 'Browser Extensions':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
          <line x1="2" y1="9" x2="22" y2="9" />
          <circle cx="6" cy="6" r="1" />
          <circle cx="10" cy="6" r="1" />
        </svg>
      );
    case 'Analytics':
    case 'Analytics & Data Science':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      );
    case 'Automation':
    case 'Automation & Tools':
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case 'Web Development':
    default:
      return (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
  }
}

/**
 * Projects Section - Featured Projects Showcase
 * @param {{ data?: object | null, onSelectProject: (project: object) => void }} props
 */
export function Projects({ data = null, onSelectProject }) {
  const isCustom = Boolean(data);
  const [selectedCategory, setSelectedCategory] = useState('All Projects');

  if (isCustom && (!data.projects || data.projects.length === 0)) {
    return null;
  }

  const rawProjects = isCustom ? data.projects : projectsData;

  const normalizedProjects = rawProjects.map((p, idx) => {
    const tech = Array.isArray(p.technologies)
      ? p.technologies
      : typeof p.technologies === 'string'
        ? p.technologies.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

    return {
      id: p.id || `proj_${idx}`,
      title: p.title || p.name || 'Untitled Project',
      fullName: p.fullName || p.title || p.name,
      category: p.category || 'Web Development',
      filterCategory: p.filterCategory || p.category || 'Web Development',
      shortDescription: p.shortDescription || p.description || '',
      description: p.description || p.shortDescription || '',
      technologies: tech,
      githubUrl: p.githubUrl || p.github_url || null,
      liveDemoUrl: p.liveDemoUrl || p.liveUrl || p.demoUrl || null,
      caseStudy: p.caseStudy || null
    };
  });

  const categories = ['All Projects', ...Array.from(new Set(normalizedProjects.map((p) => p.category)))];

  const filteredProjects = selectedCategory === 'All Projects'
    ? normalizedProjects
    : normalizedProjects.filter((p) => p.category === selectedCategory || p.filterCategory === selectedCategory);

  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionHeader
          eyebrow="PORTFOLIO"
          title="Selected Projects"
          description={isCustom ? 'Practical software applications, tools, and technical projects.' : "Some of the things I've built, explored, and worked on."}
        />

        {/* Category Filter Tabs (if more than 1 category) */}
        {categories.length > 2 && (
          <div className="projects-filter-bar" role="tablist" aria-label="Project category filter">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`filter-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}

        {/* Responsive Projects Grid: 3 col desktop, 2 col tablet, 1 col mobile */}
        <div className="projects-grid">
          {filteredProjects.map((project) => {
            const hasGithub = Boolean(project.githubUrl);
            const hasLiveDemo = Boolean(project.liveDemoUrl);

            return (
              <article key={project.id} className="project-card">
                {/* Visual Thumbnail or Neutral Aesthetic Placeholder */}
                <div className="project-thumbnail-wrapper">
                  <div className="project-neutral-placeholder" aria-hidden="true">
                    <div className="project-placeholder-icon">
                      {getCategoryIcon(project.category)}
                    </div>
                    <span className="project-placeholder-label">{project.category}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="project-card-body">
                  <div className="project-card-header">
                    <Badge variant="primary">{project.category}</Badge>
                  </div>

                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.shortDescription}</p>

                  <div className="project-technologies">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <Badge key={tech} variant="default">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 5 && (
                      <Badge variant="default">+{project.technologies.length - 5}</Badge>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="project-card-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onSelectProject && onSelectProject(project)}
                    aria-haspopup="dialog"
                  >
                    <span>View Details</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>

                  {hasGithub && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      aria-label={`${project.title} GitHub repository`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      <span>Code</span>
                    </a>
                  )}

                  {hasLiveDemo && (
                    <a
                      href={project.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      aria-label={`${project.title} live demo`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      <span>Demo</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
