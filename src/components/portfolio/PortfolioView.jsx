import React, { useState } from 'react';
import { Link } from '../../router/Router.jsx';
import { Navbar } from '../common/Navbar.jsx';
import { Hero } from '../sections/Hero.jsx';
import { About } from '../sections/About.jsx';
import { Skills } from '../sections/Skills.jsx';
import { Education } from '../sections/Education.jsx';
import { Projects } from '../sections/Projects.jsx';
import { Experience } from '../sections/Experience.jsx';
import { Services } from '../sections/Services.jsx';
import { GitHubShowcase } from '../sections/GitHubShowcase.jsx';
import { Articles } from '../sections/Articles.jsx';
import { Contact } from '../sections/Contact.jsx';
import { Footer } from '../common/Footer.jsx';
import { ProjectModal } from '../modals/ProjectModal.jsx';
import { ArticleModal } from '../modals/ArticleModal.jsx';
import { Toast } from '../common/Toast.jsx';

/**
 * Reusable, Data-Driven Portfolio Renderer
 * Used for:
 * 1. Student Builder live preview.
 * 2. Public student portfolio display (/p/:username).
 * 3. Preserved Dheeraj reference portfolio (/demo).
 *
 * @param {{
 *   portfolioData?: object | null,
 *   isPreview?: boolean,
 *   isOwner?: boolean,
 *   onEdit?: (() => void) | null
 * }} props
 */
export function PortfolioView({ portfolioData = null, isPreview = false, isOwner = false, onEdit = null }) {
  const [activeProject, setActiveProject] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const dismissToast = () => {
    setToast({ message: '', type: 'success' });
  };

  const isCustom = Boolean(portfolioData);
  const showOwnerControls = isOwner && !isPreview;

  // Determine section visibility for custom student portfolios
  const hasAbout = isCustom
    ? Boolean(portfolioData.bioIntro || (portfolioData.interests && portfolioData.interests.length > 0) || portfolioData.institution)
    : true;

  const hasSkills = isCustom
    ? Boolean(portfolioData.skills && portfolioData.skills.length > 0)
    : true;

  const hasProjects = isCustom
    ? Boolean(portfolioData.projects && portfolioData.projects.length > 0)
    : true;

  return (
    <div className={`portfolio-app ${showOwnerControls ? 'owner-view-wrapper' : ''}`}>
      {/* Authenticated Owner Navigation Strip */}
      {showOwnerControls && (
        <aside
          className="owner-nav-strip"
          role="region"
          aria-label="Owner navigation controls"
        >
          <div className="container owner-nav-inner">
            <Link href="/dashboard" className="owner-back-link">
              <span aria-hidden="true" style={{ fontSize: '1.05rem', lineHeight: 1 }}>←</span>
              <span>Back to Dashboard</span>
            </Link>

            <div className="owner-nav-actions">
              <Link href="/builder" className="owner-edit-link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Edit Portfolio</span>
              </Link>
            </div>
          </div>
        </aside>
      )}

      {/* Interactive Preview Banner (Builder Preview Mode) */}
      {isPreview && (
        <aside
          className="preview-banner"
          role="region"
          aria-label="Preview Mode Banner"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#38BDF8'
              }}
            />
            <span>
              <strong>Portfolio Preview</strong> • Viewing {portfolioData?.isPublished ? 'published' : 'draft'} portfolio for <code>@{portfolioData?.username || 'student'}</code>
            </span>
          </div>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="btn btn-secondary btn-sm"
              style={{
                backgroundColor: '#334155',
                color: '#FFFFFF',
                borderColor: '#475569',
                padding: '4px 12px',
                fontSize: '12px'
              }}
            >
              ← Back to Builder
            </button>
          )}
        </aside>
      )}

      {/* Sticky Light-Mode Navigation */}
      <Navbar data={portfolioData} isOwner={showOwnerControls} />

      {/* Main Single Page Document */}
      <main id="main-content">
        <Hero data={portfolioData} />

        {hasAbout && <About data={portfolioData} />}

        {hasSkills && <Skills data={portfolioData} />}

        {/* Education & Experience are rendered for demo, or for custom if configured */}
        {!isCustom && <Education />}

        {hasProjects && (
          <Projects
            data={portfolioData}
            onSelectProject={(project) => setActiveProject(project)}
          />
        )}

        {!isCustom && <Experience />}
        {!isCustom && <Services />}
        {!isCustom && <GitHubShowcase />}
        {!isCustom && <Articles onSelectArticle={(article) => setActiveArticle(article)} />}

        <Contact data={portfolioData} onShowToast={showToast} />
      </main>

      {/* Semantic Footer */}
      <Footer data={portfolioData} />

      {/* In-Page Accessible Case Study Modal */}
      <ProjectModal
        isOpen={Boolean(activeProject)}
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />

      {/* In-Page Accessible Technical Article Reader Modal (Demo) */}
      {!isCustom && (
        <ArticleModal
          isOpen={Boolean(activeArticle)}
          article={activeArticle}
          onClose={() => setActiveArticle(null)}
        />
      )}

      {/* Global Feedback Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={dismissToast}
      />
    </div>
  );
}
