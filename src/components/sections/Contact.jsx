import React, { useState } from 'react';
import { SectionHeader } from '../common/SectionHeader.jsx';
import { siteConfig } from '../../config/siteConfig.js';
import { submitContactForm } from '../../services/api.js';

const LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  EMAIL_MIN: 5,
  EMAIL_MAX: 120,
  SUBJECT_MAX: 150,
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 3000
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Contact Section with Accessible Form Handling & Honest Delivery Semantics
 * @param {{ onShowToast: (message: string, type: 'success' | 'error') => void }} props
 */
export function Contact({ data = null, onShowToast } = {}) {
  const isCustom = Boolean(data);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website_hp: '' // Honeypot field for bot protection
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  const configuredEmail = isCustom
    ? (data.showEmailPublicly && data.contactEmail ? data.contactEmail.trim() : '')
    : (siteConfig.contact?.email ? siteConfig.contact.email.trim() : '');

  const hasConfiguredEmail = Boolean(configuredEmail);

  const validate = () => {
    const newErrors = {};

    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name || name.length < LIMITS.NAME_MIN) {
      newErrors.name = `Please enter your name (minimum ${LIMITS.NAME_MIN} characters).`;
    } else if (name.length > LIMITS.NAME_MAX) {
      newErrors.name = `Name cannot exceed ${LIMITS.NAME_MAX} characters.`;
    }

    if (!email || email.length < LIMITS.EMAIL_MIN || !EMAIL_REGEX.test(email)) {
      newErrors.email = 'Please provide a valid email address.';
    } else if (email.length > LIMITS.EMAIL_MAX) {
      newErrors.email = `Email cannot exceed ${LIMITS.EMAIL_MAX} characters.`;
    }

    if (subject && subject.length > LIMITS.SUBJECT_MAX) {
      newErrors.subject = `Subject cannot exceed ${LIMITS.SUBJECT_MAX} characters.`;
    }

    if (!message || message.length < LIMITS.MESSAGE_MIN) {
      newErrors.message = `Please provide a message with at least ${LIMITS.MESSAGE_MIN} characters.`;
    } else if (message.length > LIMITS.MESSAGE_MAX) {
      newErrors.message = `Message cannot exceed ${LIMITS.MESSAGE_MAX} characters.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent accidental duplicate submissions

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await submitContactForm(formData);
      setSubmittedSuccess(true);
      onShowToast(response.message || 'Message accepted by server and held temporarily in session memory.', 'success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        website_hp: ''
      });
      setErrors({});
    } catch (error) {
      console.warn('[Contact Submit]', error.message);
      if (error.details) {
        setErrors(error.details);
      }
      setFormError(error.message || 'Unable to submit message. Please try again.');
      onShowToast(error.message || 'Submission failed. Please check the form.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedSuccess(false);
    setFormError(null);
    setErrors({});
  };

  const visibleSocials = Array.isArray(siteConfig.socials)
    ? siteConfig.socials.filter((s) => s.name !== 'Email' || hasConfiguredEmail)
    : [];

  return (
    <section id="contact" className="section" aria-label="Contact and Inquiries">
      <div className="container">
        <SectionHeader
          eyebrow="Initiate Contact"
          title="Let's Connect & Collaborate"
          description={
            hasConfiguredEmail
              ? "Interested in academic discussions, technical collaborations, or exploring software projects? Send an inquiry or reach out directly via email."
              : "Interested in academic discussions, technical collaborations, or exploring software projects? Use the form below to test sending a message to the local server."
          }
        />

        <div className="contact-layout">
          {/* Direct Communication Channels */}
          <div className="contact-info-panel">
            <div className="contact-card">
              {/* Direct Email Channel - Only rendered when verified address is configured */}
              {hasConfiguredEmail && (
                <div className="contact-channel">
                  <div className="channel-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className="channel-text">
                    <span className="channel-title">Direct Email</span>
                    <a href={`mailto:${configuredEmail}`} className="channel-value">
                      {configuredEmail}
                    </a>
                  </div>
                </div>
              )}

              <div className="contact-channel">
                <div className="channel-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="channel-text">
                  <span className="channel-title">Location & Zone</span>
                  <span className="channel-value">{siteConfig.contact.location}</span>
                </div>
              </div>

              <div className="contact-channel">
                <div className="channel-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="channel-text">
                  <span className="channel-title">Availability</span>
                  <span className="channel-value">{siteConfig.contact.responseTime}</span>
                </div>
              </div>

              {visibleSocials.length > 0 && (
                <div className="contact-profiles-block">
                  <span className="channel-title">Professional Profiles</span>
                  <div className="social-links-grid">
                    {visibleSocials.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        aria-label={social.ariaLabel}
                      >
                        {social.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Handling with Accessible States */}
          <div className="contact-form-wrapper">
            {/* Informational Mode Notice */}
            <div className="form-mode-notice" role="note">
              <div className="mode-notice-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <p className="mode-notice-text">
                <strong>Notice:</strong> This contact form operates in development mode and is not currently connected to an email delivery service. Submissions are temporarily held in server session memory only and do not guarantee delivery to the portfolio owner.
              </p>
            </div>

            {submittedSuccess ? (
              <div className="form-success-banner" role="status" aria-live="polite">
                <div className="success-banner-icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="success-banner-body">
                  <h3 className="success-banner-title">Message Accepted by Server</h3>
                  <p className="success-banner-text">
                    Your message was accepted by the server and held temporarily in session memory.
                    <br />
                    <em>Important: Automatic email delivery and database persistence are not configured. Submitting this form does not guarantee the owner will see or receive your message.</em>
                  </p>
                  {hasConfiguredEmail && (
                    <p className="success-banner-email-fallback">
                      For direct delivery, please email: <strong>{configuredEmail}</strong>
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleResetForm}
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate aria-label="Contact inquiry form">
                {/* Honeypot field for anti-spam bot protection */}
                <input
                  type="text"
                  name="website_hp"
                  value={formData.website_hp}
                  onChange={handleChange}
                  tabIndex="-1"
                  autoComplete="off"
                  className="form-honeypot"
                  aria-hidden="true"
                />

                {formError && (
                  <div className="form-error-banner" role="alert">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Name Field */}
                <div className="form-group">
                  <label htmlFor="contact-name" className="form-label">
                    Full Name <span className="form-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Jane Doe"
                    maxLength={LIMITS.NAME_MAX}
                    className={`form-input ${errors.name ? 'has-error' : ''}`}
                    disabled={isSubmitting}
                    required
                    aria-required="true"
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  />
                  {errors.name && (
                    <span id="contact-name-error" className="form-error-msg" role="alert">
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* 2. Email Field */}
                <div className="form-group">
                  <label htmlFor="contact-email" className="form-label">
                    Email Address <span className="form-required" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@domain.com"
                    maxLength={LIMITS.EMAIL_MAX}
                    className={`form-input ${errors.email ? 'has-error' : ''}`}
                    disabled={isSubmitting}
                    required
                    aria-required="true"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  />
                  {errors.email && (
                    <span id="contact-email-error" className="form-error-msg" role="alert">
                      {errors.email}
                    </span>
                  )}
                </div>

                {/* 3. Subject Field */}
                <div className="form-group">
                  <label htmlFor="contact-subject" className="form-label">
                    Subject / Topic <span className="form-optional">(Optional)</span>
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Technical Collaboration / Software Discussion"
                    maxLength={LIMITS.SUBJECT_MAX}
                    className="form-input"
                    disabled={isSubmitting}
                    aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                  />
                  {errors.subject && (
                    <span id="contact-subject-error" className="form-error-msg" role="alert">
                      {errors.subject}
                    </span>
                  )}
                </div>

                {/* 4. Message Field */}
                <div className="form-group">
                  <div className="form-label-row">
                    <label htmlFor="contact-message" className="form-label">
                      Message Details <span className="form-required" aria-hidden="true">*</span>
                    </label>
                    <span id="contact-message-counter" className="form-char-count" aria-live="polite">
                      {formData.message.length} / {LIMITS.MESSAGE_MAX}
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your project concept, collaboration idea, or technical question..."
                    maxLength={LIMITS.MESSAGE_MAX}
                    className={`form-textarea ${errors.message ? 'has-error' : ''}`}
                    disabled={isSubmitting}
                    required
                    aria-required="true"
                    aria-invalid={errors.message ? 'true' : 'false'}
                    aria-describedby={errors.message ? 'contact-message-error' : 'contact-message-counter'}
                  />
                  {errors.message && (
                    <span id="contact-message-error" className="form-error-msg" role="alert">
                      {errors.message}
                    </span>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-dot" aria-hidden="true" />
                      <span>Submitting Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Message</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
