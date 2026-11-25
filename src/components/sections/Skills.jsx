import React, { useState } from 'react';
import { SectionHeader } from '../common/SectionHeader.jsx';
import { Badge } from '../common/Badge.jsx';
import { skillsData, allSkillsList } from '../../data/skills.js';

/**
 * Professional SVG Icons for Technologies & Tools
 */
function TechIcon({ type }) {
  const iconProps = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  };

  switch (type) {
    case 'c':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15 9a4.2 4.2 0 1 0 0 6" />
        </svg>
      );
    case 'python':
      return (
        <svg {...iconProps}>
          <path d="M12 2a4 4 0 0 0-4 4v2h4a2 2 0 0 1 2 2v2h2a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4h-4z" />
          <path d="M12 22a4 4 0 0 0 4-4v-2h-4a2 2 0 0 1-2-2v-2H8a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h4z" />
          <circle cx="9.5" cy="4.5" r="0.7" fill="currentColor" />
          <circle cx="14.5" cy="19.5" r="0.7" fill="currentColor" />
        </svg>
      );
    case 'java':
      return (
        <svg {...iconProps}>
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      );
    case 'javascript':
      return (
        <svg {...iconProps}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M9 16.5v-4" />
          <path d="M15 16.5a2.5 2.5 0 0 1-2.5-2.5" />
        </svg>
      );
    case 'html5':
      return (
        <svg {...iconProps}>
          <path d="M4 3l1.8 17 6.2 2 6.2-2L20 3H4z" />
          <path d="M16.5 7.5H8l.4 4h7.6l-.6 6-4 1.3-4-1.3-.2-2" />
        </svg>
      );
    case 'css3':
      return (
        <svg {...iconProps}>
          <path d="M4 3l1.8 17 6.2 2 6.2-2L20 3H4z" />
          <path d="M7.5 7.5h9l-.8 8-3.7 1.2-3.7-1.2" />
        </svg>
      );
    case 'react':
      return (
        <svg {...iconProps}>
          <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(150 12 12)" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      );
    case 'nodejs':
      return (
        <svg {...iconProps}>
          <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" />
          <path d="M12 12l8-4.5" />
          <path d="M12 12v8" />
          <path d="M12 12L4 7.5" />
        </svg>
      );
    case 'api':
      return (
        <svg {...iconProps}>
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      );
    case 'git':
      return (
        <svg {...iconProps}>
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <circle cx="18" cy="6" r="3" />
          <path d="M6 9v6a3 3 0 0 0 3 3h6" />
          <line x1="18" y1="9" x2="18" y2="15" />
        </svg>
      );
    case 'github':
      return (
        <svg {...iconProps} fill="currentColor">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      );
    case 'vscode':
      return (
        <svg {...iconProps}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'pycharm':
      return (
        <svg {...iconProps}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="7" y1="8" x2="11" y2="8" />
          <line x1="7" y1="12" x2="17" y2="12" />
          <line x1="7" y1="16" x2="14" y2="16" />
        </svg>
      );
    case 'linux':
      return (
        <svg {...iconProps}>
          <path d="M4 17l6-6-6-6" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case 'numpy':
      return (
        <svg {...iconProps}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'pandas':
      return (
        <svg {...iconProps}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'matplotlib':
      return (
        <svg {...iconProps}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case 'ai':
      return (
        <svg {...iconProps}>
          <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
          <line x1="10" y1="22" x2="14" y2="22" />
        </svg>
      );
    case 'security':
      return (
        <svg {...iconProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'automation':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
  }
}

function resolveIconType(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('react')) return 'react';
  if (lower.includes('python')) return 'python';
  if (lower.includes('javascript') || lower.includes('js')) return 'javascript';
  if (lower.includes('node')) return 'node';
  if (lower.includes('html')) return 'html';
  if (lower.includes('css')) return 'css';
  if (lower.includes('git')) return 'git';
  if (lower.includes('linux')) return 'linux';
  if (lower.includes('sql')) return 'sql';
  if (lower.includes('electron')) return 'electron';
  if (lower.includes('java') && !lower.includes('script')) return 'java';
  if (lower === 'c' || lower === 'c++') return 'c';
  return 'default';
}

export function Skills({ data = null } = {}) {
  const isCustom = Boolean(data);
  const [activeFilter, setActiveFilter] = useState('All');

  // If custom student portfolio has zero skills, return null
  if (isCustom && (!data.skills || data.skills.length === 0)) {
    return null;
  }

  if (isCustom) {
    const studentSkills = Array.isArray(data.skills) ? data.skills : [];
    return (
      <section id="skills" className="section" aria-label="Skills and Technologies">
        <div className="container">
          <SectionHeader
            eyebrow="TECHNICAL STACK"
            title="Skills & Technologies"
            description="Verified skills, languages, tools, and platforms."
          />

          <div className="skills-interactive-grid" role="list">
            {studentSkills.map((skillName) => (
              <div
                key={skillName}
                className="skill-tech-card"
                role="listitem"
              >
                <div className="skill-tech-icon-container">
                  <TechIcon type={resolveIconType(skillName)} />
                </div>
                <div className="skill-tech-info">
                  <span className="skill-tech-name">{skillName}</span>
                  <span className="skill-tech-category">Proficiency Area</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Filter Categories for default Demo portfolio
  const filterTabs = [
    'All',
    'Programming',
    'Frontend',
    'Backend',
    'Tools',
    'Data Analytics',
    'Technical Interests'
  ];

  const displayedSkills = activeFilter === 'All'
    ? allSkillsList
    : allSkillsList.filter((item) => item.category === activeFilter);

  return (
    <section id="skills" className="section" aria-label="Skills and Technologies">
      <div className="container">
        <SectionHeader
          eyebrow="Technical Stack"
          title="Skills & Technologies"
          description="Tools, languages, and technical frameworks utilized in building software applications, extensions, and data utilities."
        />

        {/* Optional Category Filter Tabs */}
        <div className="skills-filter-tabs" role="tablist" aria-label="Skill categories">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`filter-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Interactive Responsive Grid of Clean Technology Cards */}
        <div className="skills-interactive-grid" role="list">
          {displayedSkills.map((skill) => (
            <div
              key={`${skill.category}-${skill.name}`}
              className="skill-tech-card"
              role="listitem"
            >
              <div className="skill-tech-icon-container">
                <TechIcon type={skill.iconType} />
              </div>
              <div className="skill-tech-info">
                <span className="skill-tech-name">{skill.name}</span>
                <span className="skill-tech-category">{skill.category}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Structural Category Overview Panels */}
        <div className="skills-category-panels">
          {skillsData.categories.map((cat) => (
            <div key={cat.id} className="skills-category-panel">
              <div className="category-panel-header">
                <h3 className="category-panel-title">{cat.name}</h3>
                <span className="category-panel-count">{cat.skills.length} Technologies</span>
              </div>
              <p className="category-panel-desc">{cat.description}</p>
              <div className="category-panel-tags">
                {cat.skills.map((s) => (
                  <Badge key={s.name} variant="default">
                    {s.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
