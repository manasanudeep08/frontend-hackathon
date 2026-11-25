import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRouter, Link } from '../../router/Router.jsx';
import {
  getStudentPortfolio,
  updateStudentPortfolio,
  publishStudentPortfolio,
  unpublishStudentPortfolio
} from '../../services/portfolioApi.js';
import {
  INTEREST_CATEGORIES,
  SUGGESTED_SKILLS_BY_INTEREST,
  PROJECT_CATEGORIES
} from '../../data/builderData.js';
import { PortfolioView } from '../portfolio/PortfolioView.jsx';

/**
 * Category SVG Icon Renderer
 */
function CategoryIcon({ type }) {
  const props = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true'
  };

  switch (type) {
    case 'code':
      return (
        <svg {...props}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'cpu':
      return (
        <svg {...props}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'bar-chart':
      return (
        <svg {...props}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'smartphone':
      return (
        <svg {...props}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'layout':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      );
    case 'cloud':
      return (
        <svg {...props}>
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        </svg>
      );
    case 'zap':
      return (
        <svg {...props}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'radio':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
        </svg>
      );
    case 'gamepad':
      return (
        <svg {...props}>
          <line x1="6" y1="12" x2="10" y2="12" />
          <line x1="8" y1="10" x2="8" y2="14" />
          <line x1="15" y1="13" x2="15.01" y2="13" />
          <line x1="18" y1="11" x2="18.01" y2="11" />
          <rect x="2" y="6" width="20" height="12" rx="6" />
        </svg>
      );
    case 'link':
      return (
        <svg {...props}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    case 'terminal':
    default:
      return (
        <svg {...props}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
  }
}

/**
 * Five-Minute Student Portfolio Builder Component
 *
 * Steps:
 * 1. Basic Information
 * 2. Select Interests
 * 3. Skills & Projects
 * 4. Preview & Publish
 *
 * @param {{ initialStep?: number }} props
 */
export function StudentPortfolioBuilder({ initialStep = 1 }) {
  const { user, csrfToken, refreshUser } = useAuth();
  const { navigate } = useRouter();

  const [step, setStep] = useState(initialStep);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Autosave status: 'saved' | 'saving' | 'error' | 'idle'
  const [saveStatus, setSaveStatus] = useState('saved');
  const [saveError, setSaveError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    headline: '',
    bioIntro: '',
    degree: '',
    institution: '',
    academicPeriod: '',
    location: '',
    contactEmail: '',
    showEmailPublicly: false,
    githubUrl: '',
    linkedinUrl: '',
    interests: [],
    skills: [],
    projects: []
  });

  const [portfolioMeta, setPortfolioMeta] = useState({
    slug: '',
    isPublished: false,
    updatedAt: ''
  });

  // Step 3 Sub-state
  const [skillSearch, setSkillSearch] = useState('');
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  // Track latest form data in ref to avoid debounced closure stale reads
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const saveTimeoutRef = useRef(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);

  // Load saved draft on mount
  useEffect(() => {
    let isMounted = true;

    async function loadDraft() {
      try {
        const p = await getStudentPortfolio();
        if (isMounted) {
          setFormData({
            fullName: p.fullName || user?.fullName || '',
            headline: p.headline || '',
            bioIntro: p.bioIntro || '',
            degree: p.degree || '',
            institution: p.institution || '',
            academicPeriod: p.academicPeriod || '',
            location: p.location || '',
            contactEmail: p.contactEmail || '',
            showEmailPublicly: Boolean(p.showEmailPublicly),
            githubUrl: p.githubUrl || '',
            linkedinUrl: p.linkedinUrl || '',
            interests: Array.isArray(p.interests) ? p.interests : [],
            skills: Array.isArray(p.skills) ? p.skills : [],
            projects: Array.isArray(p.projects) ? p.projects : []
          });

          setPortfolioMeta({
            slug: p.slug || user?.username?.toLowerCase() || '',
            isPublished: Boolean(p.isPublished),
            updatedAt: p.updatedAt || ''
          });
          setLoadingInitial(false);
        }
      } catch (err) {
        if (isMounted) {
          // Pre-populate with authenticated student name
          setFormData((prev) => ({
            ...prev,
            fullName: user?.fullName || ''
          }));
          setPortfolioMeta((prev) => ({
            ...prev,
            slug: user?.username?.toLowerCase() || ''
          }));
          setLoadingInitial(false);
        }
      }
    }

    loadDraft();

    return () => {
      isMounted = false;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [user]);

  // Execute Save API Call
  const performSave = useCallback(
    async (manual = false) => {
      if (isSavingRef.current) {
        pendingSaveRef.current = true;
        return;
      }

      isSavingRef.current = true;
      setSaveStatus('saving');
      setSaveError('');

      try {
        const res = await updateStudentPortfolio(formDataRef.current, csrfToken);
        setSaveStatus('saved');
        if (res.portfolio) {
          setPortfolioMeta((prev) => ({
            ...prev,
            updatedAt: res.portfolio.updatedAt,
            isPublished: Boolean(res.portfolio.isPublished)
          }));
        }
      } catch (err) {
        setSaveStatus('error');
        setSaveError(err.message || 'Failed to save changes.');
      } finally {
        isSavingRef.current = false;
        if (pendingSaveRef.current) {
          pendingSaveRef.current = false;
          performSave(false);
        }
      }
    },
    [csrfToken]
  );

  // Trigger Debounced Autosave on changes
  const triggerAutosave = useCallback(() => {
    if (loadingInitial) return;
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      performSave(false);
    }, 1000); // 1-second debounce
  }, [loadingInitial, performSave]);

  const updateField = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      formDataRef.current = next;
      return next;
    });
    triggerAutosave();
  };

  // Step 2 Interests handling
  const toggleInterest = (interestName) => {
    const current = formData.interests || [];
    let updated;
    if (current.includes(interestName)) {
      updated = current.filter((i) => i !== interestName);
    } else {
      if (current.length >= 8) {
        alert('You may select up to 8 primary interest areas.');
        return;
      }
      updated = [...current, interestName];
    }
    updateField('interests', updated);
  };

  // Step 3 Skills handling
  const toggleSkill = (skillName) => {
    const current = formData.skills || [];
    const trimmed = skillName.trim();
    if (!trimmed) return;

    let updated;
    if (current.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      updated = current.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
    } else {
      if (current.length >= 30) {
        alert('You may select up to 30 skills.');
        return;
      }
      updated = [...current, trimmed];
    }
    updateField('skills', updated);
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    toggleSkill(trimmed);
    setCustomSkillInput('');
  };

  // Step 3 Project handlers
  const handleOpenAddProject = () => {
    setEditingProject({
      id: `proj_${Date.now()}`,
      title: '',
      description: '',
      category: 'Web Development',
      technologies: '',
      githubUrl: '',
      liveUrl: ''
    });
    setProjectModalOpen(true);
  };

  const handleEditProject = (p) => {
    setEditingProject({
      id: p.id,
      title: p.title || p.name || '',
      description: p.description || p.shortDescription || '',
      category: p.category || 'Web Development',
      technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || ''),
      githubUrl: p.githubUrl || '',
      liveUrl: p.liveUrl || p.liveDemoUrl || ''
    });
    setProjectModalOpen(true);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!editingProject) return;

    if (!editingProject.title.trim() || editingProject.title.trim().length < 2) {
      alert('Project title is required (minimum 2 characters).');
      return;
    }
    if (!editingProject.description.trim() || editingProject.description.trim().length < 5) {
      alert('Project description is required (minimum 5 characters).');
      return;
    }

    const techArray = editingProject.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedProjects = [...formData.projects];
    const existingIndex = updatedProjects.findIndex((p) => p.id === editingProject.id);

    const projectObj = {
      id: editingProject.id,
      title: editingProject.title.trim(),
      name: editingProject.title.trim(),
      description: editingProject.description.trim(),
      shortDescription: editingProject.description.trim(),
      category: editingProject.category,
      technologies: techArray,
      githubUrl: editingProject.githubUrl.trim() || null,
      liveUrl: editingProject.liveUrl.trim() || null
    };

    if (existingIndex >= 0) {
      updatedProjects[existingIndex] = projectObj;
    } else {
      updatedProjects.push(projectObj);
    }

    updateField('projects', updatedProjects);
    setProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId) => {
    if (!confirm('Are you sure you want to remove this project?')) return;
    const updated = formData.projects.filter((p) => p.id !== projectId);
    updateField('projects', updated);
  };

  // Step 4 Publish / Unpublish actions
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');

  const handlePublish = async () => {
    setPublishing(true);
    setPublishMessage('');

    // Ensure pending fields are saved first
    try {
      await performSave(true);
      const res = await publishStudentPortfolio(csrfToken);
      setPortfolioMeta((prev) => ({
        ...prev,
        isPublished: true
      }));
      setPublishMessage('Your portfolio is now live and published!');
      if (refreshUser) refreshUser();
    } catch (err) {
      alert(err.message || 'Failed to publish portfolio.');
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm('Convert your portfolio back to draft? It will no longer be visible publicly.')) return;
    setPublishing(true);
    try {
      await unpublishStudentPortfolio(csrfToken);
      setPortfolioMeta((prev) => ({
        ...prev,
        isPublished: false
      }));
      setPublishMessage('Portfolio reverted to private draft.');
      if (refreshUser) refreshUser();
    } catch (err) {
      alert(err.message || 'Failed to unpublish portfolio.');
    } finally {
      setPublishing(false);
    }
  };

  if (loadingInitial) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--accent-blue)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto var(--space-3)'
            }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Loading portfolio builder...
          </p>
        </div>
      </div>
    );
  }

  // Combined preview data object for live preview
  const livePreviewData = {
    ...formData,
    username: portfolioMeta.slug,
    slug: portfolioMeta.slug,
    isPublished: portfolioMeta.isPublished
  };

  return (
    <div className="portfolio-builder-wrapper" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Builder Header with Navigation & Autosave */}
      <header className="navbar-wrapper" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container">
          <div className="navbar-inner" style={{ height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Link href="/dashboard" className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>
                ← Dashboard
              </Link>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', fontWeight: '600' }}>
                Portfolio Builder
              </span>
            </div>

            {/* Autosave Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                role="status"
                aria-live="polite"
                style={{
                  fontSize: 'var(--font-size-xs)',
                  color: saveStatus === 'error' ? 'var(--color-danger)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {saveStatus === 'saving' && (
                  <>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-blue)',
                        animation: 'spin 1s infinite'
                      }}
                    />
                    <span>Saving...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span>
                    <span>All changes saved</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <button
                    type="button"
                    onClick={() => performSave(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-danger)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: 'var(--font-size-xs)'
                    }}
                  >
                    Save failed. Click to retry
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => performSave(true)}
                className="btn btn-secondary btn-sm"
              >
                Save Draft
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Step Wizard Progress Bar */}
      <div className="builder-wizard-container">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="builder-wizard-nav">
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'Interests' },
              { num: 3, label: 'Skills & Projects' },
              { num: 4, label: 'Preview & Publish' }
            ].map((s) => {
              const isActive = step === s.num;
              const isPassed = step > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num)}
                  className="builder-step-btn"
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className={`builder-step-circle ${
                      isActive
                        ? 'builder-step-circle-active'
                        : isPassed
                        ? 'builder-step-circle-completed'
                        : 'builder-step-circle-upcoming'
                    }`}
                  >
                    {isPassed ? '✓' : s.num}
                  </span>
                  <span className={`builder-step-text ${isActive ? 'builder-step-text-active' : ''}`} style={{ color: isActive ? 'var(--accent-blue)' : (isPassed ? 'var(--text-primary)' : 'var(--text-secondary)') }}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Step Body */}
      <main className="container" style={{ maxWidth: '900px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        {/* ========================================================================= */}
        {/* STEP 1: Basic Information */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="contact-card">
            <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              Step 1 — Basic Information
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)' }}>
              Enter your foundational details. Required fields are marked with an asterisk (*).
            </p>

            <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Your Public Portfolio Address:
              </span>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--accent-blue)', marginTop: '2px' }}>
                /p/{portfolioMeta.slug}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="headline">
                  Professional / Student Headline *
                </label>
                <input
                  id="headline"
                  type="text"
                  className="form-input"
                  value={formData.headline}
                  onChange={(e) => updateField('headline', e.target.value)}
                  placeholder="e.g. Full-Stack Developer & CSE Undergraduate"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bioIntro">
                Short Introduction / Bio
              </label>
              <textarea
                id="bioIntro"
                className="form-textarea"
                rows={3}
                value={formData.bioIntro}
                onChange={(e) => updateField('bioIntro', e.target.value)}
                placeholder="Brief description of your passion, background, and goals in software development..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="degree">
                  Degree / Program
                </label>
                <input
                  id="degree"
                  type="text"
                  className="form-input"
                  value={formData.degree}
                  onChange={(e) => updateField('degree', e.target.value)}
                  placeholder="e.g. B.Tech Computer Science"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="institution">
                  Institution / University
                </label>
                <input
                  id="institution"
                  type="text"
                  className="form-input"
                  value={formData.institution}
                  onChange={(e) => updateField('institution', e.target.value)}
                  placeholder="e.g. KL University"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="academicPeriod">
                  Academic Period
                </label>
                <input
                  id="academicPeriod"
                  type="text"
                  className="form-input"
                  value={formData.academicPeriod}
                  onChange={(e) => updateField('academicPeriod', e.target.value)}
                  placeholder="e.g. 2025 – 2029"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g. Hyderabad, India"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="contactEmail">
                  Contact Email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  className="form-input"
                  value={formData.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={formData.showEmailPublicly}
                    onChange={(e) => updateField('showEmailPublicly', e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Display email address on public portfolio</span>
                </label>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Off by default. When disabled, visitors can only use the on-page message form.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="githubUrl">
                  GitHub Profile URL
                </label>
                <input
                  id="githubUrl"
                  type="url"
                  className="form-input"
                  value={formData.githubUrl}
                  onChange={(e) => updateField('githubUrl', e.target.value)}
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="linkedinUrl">
                  LinkedIn Profile URL
                </label>
                <input
                  id="linkedinUrl"
                  type="url"
                  className="form-input"
                  value={formData.linkedinUrl}
                  onChange={(e) => updateField('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (!formData.fullName.trim()) {
                    alert('Full name is required.');
                    return;
                  }
                  if (!formData.headline.trim()) {
                    alert('Headline is required.');
                    return;
                  }
                  setStep(2);
                }}
              >
                <span>Continue to Interests →</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Select Interests */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="contact-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                  Step 2 — Select Technical Interests
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  Choose up to 8 primary focus areas. These will be highlighted on your About section and inform skill suggestions.
                </p>
              </div>

              <span
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '600',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: formData.interests.length > 0 ? 'var(--accent-blue-light)' : 'var(--bg-secondary)',
                  color: formData.interests.length > 0 ? 'var(--accent-blue)' : 'var(--text-secondary)'
                }}
              >
                {formData.interests.length} of 8 Selected
              </span>
            </div>

            {/* Selectable Interest Cards Grid */}
            <div className="builder-interest-grid">
              {INTEREST_CATEGORIES.map((cat) => {
                const isSelected = formData.interests.includes(cat.name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleInterest(cat.name)}
                    className={`builder-interest-card ${isSelected ? 'is-selected' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <div className={`builder-interest-icon ${isSelected ? 'builder-interest-icon-selected' : 'builder-interest-icon-default'}`}>
                        <CategoryIcon type={cat.icon} />
                      </div>

                      {isSelected && (
                        <span style={{ color: 'var(--accent-blue)', fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
                          ✓
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {cat.name}
                      </h3>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>
                        {cat.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
                <span>Continue to Skills & Projects →</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Skills & Projects */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Part A: Skills Selection */}
            <div className="contact-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                    Skills Selection
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    Select from recommendations tailored to your interests, or add your own custom skills.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--accent-blue-light)',
                    color: 'var(--accent-blue)'
                  }}
                >
                  {formData.skills.length} of 30 Selected
                </span>
              </div>

              {/* Selected Skills Chips */}
              {formData.skills.length > 0 && (
                <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>
                    Your Selected Skills (click to remove):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {formData.skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className="skill-chip skill-chip-selected"
                        title={`Remove ${skill}`}
                      >
                        <span>{skill}</span>
                        <span style={{ fontSize: '10px' }}>✕</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Skill Input */}
              <form onSubmit={handleAddCustomSkill} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  placeholder="Type a custom skill (e.g. Next.js, PyTorch) and press Add..."
                />
                <button type="submit" className="btn btn-secondary btn-sm" disabled={!customSkillInput.trim()}>
                  Add Skill
                </button>
              </form>

              {/* Suggested Skills Grouped by Selected Interests */}
              <div>
                <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '700', color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
                  Recommended Skills for Your Interests:
                </h3>

                {formData.interests.length === 0 ? (
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                    No interests selected yet. Select interests in Step 2 to view targeted suggestions, or use the custom input above.
                  </p>
                ) : (
                  formData.interests.map((interest) => {
                    const suggestions = SUGGESTED_SKILLS_BY_INTEREST[interest] || [];
                    if (suggestions.length === 0) return null;

                    return (
                      <div key={interest} style={{ marginBottom: 'var(--space-3)' }}>
                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--text-secondary)' }}>
                          {interest}:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: '4px' }}>
                          {suggestions.map((skillName) => {
                            const isSelected = formData.skills.some((s) => s.toLowerCase() === skillName.toLowerCase());
                            return (
                              <button
                                key={skillName}
                                type="button"
                                role="button"
                                aria-pressed={isSelected}
                                onClick={() => toggleSkill(skillName)}
                                className={`skill-chip ${isSelected ? 'skill-chip-selected' : 'skill-chip-suggestion'}`}
                              >
                                {isSelected ? `✓ ${skillName}` : `+ ${skillName}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Part B: Projects Entry */}
            <div className="contact-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                    Featured Projects
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    Add real software projects you have built. Optional — can be completed later.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddProject}
                  className="btn btn-primary btn-sm"
                >
                  + Add Project
                </button>
              </div>

              {/* Projects List */}
              {formData.projects.length === 0 ? (
                <div style={{ padding: 'var(--space-6)', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    No projects added yet. Click "+ Add Project" above, or continue to preview.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {formData.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="builder-project-card"
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                            {proj.title || proj.name}
                          </h4>
                          <span
                            style={{
                              fontSize: 'var(--font-size-xs)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'var(--accent-blue-light)',
                              color: 'var(--accent-blue)',
                              fontWeight: '500'
                            }}
                          >
                            {proj.category}
                          </span>
                        </div>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                          {proj.description}
                        </p>
                        {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                            {proj.technologies.map((t) => (
                              <span
                                key={t}
                                style={{
                                  fontSize: '11px',
                                  padding: '1px 6px',
                                  backgroundColor: 'var(--bg-secondary)',
                                  borderRadius: 'var(--radius-sm)',
                                  color: 'var(--text-secondary)',
                                  border: '1px solid var(--border-color)'
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleEditProject(proj)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--color-danger)' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                  ← Back to Interests
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setStep(4)}>
                  <span>Preview & Publish →</span>
                </button>
              </div>
            </div>

            {/* Project Entry Modal */}
            {projectModalOpen && editingProject && (
              <div
                role="dialog"
                aria-modal="true"
                className="builder-modal-backdrop"
              >
                <div
                  className="builder-modal-dialog"
                  style={{ padding: 'var(--space-6)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)' }}>
                      {formData.projects.some((p) => p.id === editingProject.id) ? 'Edit Project' : 'Add New Project'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setProjectModalOpen(false)}
                      style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveProject}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="projTitle">
                        Project Name *
                      </label>
                      <input
                        id="projTitle"
                        type="text"
                        className="form-input"
                        value={editingProject.title}
                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                        placeholder="e.g. DeviceBridge"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="projDesc">
                        Short Description *
                      </label>
                      <textarea
                        id="projDesc"
                        className="form-textarea"
                        rows={3}
                        value={editingProject.description}
                        onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                        placeholder="What problem does this project solve? What did you build?"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="projCat">
                        Category
                      </label>
                      <select
                        id="projCat"
                        className="form-input"
                        value={editingProject.category}
                        onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                      >
                        {PROJECT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="projTech">
                        Technologies Used (comma separated)
                      </label>
                      <input
                        id="projTech"
                        type="text"
                        className="form-input"
                        value={editingProject.technologies}
                        onChange={(e) => setEditingProject({ ...editingProject, technologies: e.target.value })}
                        placeholder="e.g. React, Node.js, WebSockets"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="projGit">
                        GitHub URL (optional)
                      </label>
                      <input
                        id="projGit"
                        type="url"
                        className="form-input"
                        value={editingProject.githubUrl}
                        onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                        placeholder="https://github.com/username/project"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="projLive">
                        Live Demo URL (optional)
                      </label>
                      <input
                        id="projLive"
                        type="url"
                        className="form-input"
                        value={editingProject.liveUrl}
                        onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                        placeholder="https://myproject.app"
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setProjectModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Project
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Preview & Publish */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Publish Control Card */}
            <div className="contact-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--text-primary)', margin: 0, fontWeight: 'var(--font-weight-bold)' }}>
                      Portfolio Status:
                    </h2>
                    <span className={`badge-status ${portfolioMeta.isPublished ? 'badge-published' : 'badge-draft'}`}>
                      <span className={`badge-dot ${portfolioMeta.isPublished ? 'badge-dot-green' : 'badge-dot-amber'}`} />
                      {portfolioMeta.isPublished ? 'Live & Published' : 'Draft Mode'}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', marginTop: '4px', margin: 0 }}>
                    Public Link: <strong>/p/{portfolioMeta.slug}</strong>
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setStep(3)}
                  >
                    ← Edit Details
                  </button>

                  {portfolioMeta.isPublished ? (
                    <>
                      <Link
                        href={`/p/${portfolioMeta.slug}`}
                        target="_blank"
                        className="btn btn-secondary btn-sm"
                      >
                        Open Live Link ↗
                      </Link>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={handleUnpublish}
                        disabled={publishing}
                      >
                        Unpublish (Draft)
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handlePublish}
                      disabled={publishing}
                    >
                      <span>{publishing ? 'Publishing...' : 'Publish Portfolio'}</span>
                    </button>
                  )}
                </div>
              </div>

              {publishMessage && (
                <div
                  style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-3)',
                    backgroundColor: portfolioMeta.isPublished ? '#ECFDF5' : 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: 'var(--font-size-xs)',
                    color: portfolioMeta.isPublished ? 'var(--color-success)' : 'var(--text-primary)'
                  }}
                >
                  {publishMessage}
                </div>
              )}
            </div>

            {/* Live Portfolio Preview Rendering */}
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <PortfolioView
                portfolioData={livePreviewData}
                isPreview={true}
                onEdit={() => setStep(1)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
