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
 * Preserved Reference Portfolio Demo
 * Displays STUDENT's portfolio showcase as the visual template.
 */
export function DemoPortfolio() {
  const [activeProject, setActiveProject] = useState(null);
  const [activeArticle, setActiveArticle] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const dismissToast = () => {
    setToast({ message: '', type: 'success' });
  };

  return (
    <div className="portfolio-app demo-portfolio-wrapper">
      {/* Sticky Demo Navigation Strip: Visible immediately and remains accessible on scroll */}
      <div className="demo-platform-banner" role="region" aria-label="Demo portfolio banner">
        <div className="container demo-banner-inner">
          <Link href="/" className="demo-back-btn">
            <span aria-hidden="true" style={{ fontSize: '1.05rem', lineHeight: 1 }}>←</span>
            <span>Back to Platform</span>
          </Link>
          <span className="demo-banner-badge">
            Demo Portfolio
          </span>
        </div>
      </div>

      {/* Sticky Light-Mode Navigation */}
      <Navbar isDemo={true} />

      {/* Main Single Page Document: Each section rendered exactly once */}
      <main id="main-content">
        <Hero />
        <About />
        <Skills />
        <Education />
        <Projects onSelectProject={(project) => setActiveProject(project)} />
        <Experience />
        <Services />
        <GitHubShowcase />
        <Articles onSelectArticle={(article) => setActiveArticle(article)} />
        <Contact onShowToast={showToast} />
      </main>

      {/* Semantic Footer with Exit Demo link */}
      <Footer isDemo={true} />

      {/* In-Page Accessible Case Study Modal */}
      <ProjectModal
        isOpen={Boolean(activeProject)}
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />

      {/* In-Page Accessible Technical Article Reader Modal */}
      <ArticleModal
        isOpen={Boolean(activeArticle)}
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
      />

      {/* Global Non-Intrusive Feedback Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={dismissToast}
      />
    </div>
  );
}
