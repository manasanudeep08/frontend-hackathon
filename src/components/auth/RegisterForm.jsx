import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRouter, Link } from '../../router/Router.jsx';

/**
 * Student Registration Form
 * Validates user inputs with field-level feedback, safely creates account in JSON storage,
 * and seamlessly redirects to the 5-minute portfolio builder.
 */
export function RegisterForm() {
  const { register } = useAuth();
  const { navigate } = useRouter();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Field-level and global error states
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    username: '',
    password: ''
  });
  const [generalError, setGeneralError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInputs = () => {
    const errors = { fullName: '', username: '', password: '' };
    let hasError = false;

    const cleanName = fullName.trim();
    if (!cleanName || cleanName.length < 2) {
      errors.fullName = 'Please enter your full name (at least 2 characters).';
      hasError = true;
    } else if (cleanName.length > 100) {
      errors.fullName = 'Full name must not exceed 100 characters.';
      hasError = true;
    }

    const cleanUser = username.trim();
    if (!cleanUser || cleanUser.length < 3) {
      errors.username = 'Username must be at least 3 characters long.';
      hasError = true;
    } else if (cleanUser.length > 30) {
      errors.username = 'Username must not exceed 30 characters.';
      hasError = true;
    } else if (!/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
      errors.username = 'Username may only contain letters, numbers, and underscores (no spaces).';
      hasError = true;
    }

    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
      hasError = true;
    } else if (password.length > 128) {
      errors.password = 'Password must not exceed 128 characters.';
      hasError = true;
    }

    setFieldErrors(errors);
    return !hasError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);
    const cleanUser = username.trim();
    const cleanName = fullName.trim();

    try {
      await register(cleanUser, password, cleanName);
      // Auto login successful, navigate directly to portfolio builder
      navigate('/builder');
    } catch (err) {
      const msg = err.message || 'Registration failed.';

      if (msg.toLowerCase().includes('already taken') || msg.toLowerCase().includes('duplicate')) {
        setFieldErrors((prev) => ({
          ...prev,
          username: 'This username is already taken. Please choose another username.'
        }));
      } else {
        setGeneralError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="container" style={{ maxWidth: '480px', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
        <div className="ui-card" style={{ padding: 'var(--space-8)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-blue-light)',
                color: 'var(--accent-blue)',
                border: '1px solid var(--accent-blue-border)',
                marginBottom: 'var(--space-3)',
                fontWeight: 'bold',
                fontSize: 'var(--font-size-xl)'
              }}
            >
              P
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              Create Student Account
            </h1>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Get started in under five minutes. Create your personal profile and showcase your developer projects.
            </p>
          </div>

          {/* General Alert Banner */}
          {generalError && (
            <div
              role="alert"
              style={{
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                color: 'var(--color-error)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--space-5)',
                lineHeight: '1.5',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span aria-hidden="true" style={{ fontWeight: 'bold' }}>⚠️</span>
              <span><strong>Notice:</strong> {generalError}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="register-fullname" className="form-label" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Full Name <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="register-fullname"
                type="text"
                className="form-input"
                placeholder="e.g. STUDENT"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: '' }));
                }}
                autoComplete="name"
                autoFocus
                disabled={isSubmitting}
                style={fieldErrors.fullName ? { borderColor: 'var(--color-error)' } : {}}
                required
              />
              {fieldErrors.fullName ? (
                <span role="alert" style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', marginTop: '4px', fontWeight: '500' }}>
                  {fieldErrors.fullName}
                </span>
              ) : (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  Your real name shown on your public portfolio.
                </span>
              )}
            </div>

            {/* Username */}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="register-username" className="form-label" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Username <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="register-username"
                type="text"
                className="form-input"
                placeholder="e.g. student"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: '' }));
                }}
                autoComplete="username"
                disabled={isSubmitting}
                style={fieldErrors.username ? { borderColor: 'var(--color-error)' } : {}}
                required
              />
              {fieldErrors.username ? (
                <span role="alert" style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', marginTop: '4px', fontWeight: '500' }}>
                  {fieldErrors.username}
                </span>
              ) : (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  Letters, numbers, and underscores only. Your portfolio URL will be: <code>/p/{username || 'username'}</code>
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
              <label htmlFor="register-password" className="form-label" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Password <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <input
                id="register-password"
                type="password"
                className="form-input"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                }}
                autoComplete="new-password"
                disabled={isSubmitting}
                style={fieldErrors.password ? { borderColor: 'var(--color-error)' } : {}}
                required
              />
              {fieldErrors.password ? (
                <span role="alert" style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', marginTop: '4px', fontWeight: '500' }}>
                  {fieldErrors.password}
                </span>
              ) : (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  Must be at least 8 characters long.
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ padding: '10px 16px', fontSize: 'var(--font-size-base)' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#FFFFFF',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }}
                  />
                  Creating Account...
                </span>
              ) : (
                'Create Portfolio Account'
              )}
            </button>
          </form>

          {/* Navigation Links */}
          <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Already registered?{' '}
              <Link href="/login" style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--accent-blue)' }}>
                Sign in to your account
              </Link>
            </p>

            <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Link href="/admin/login" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                Administrator Login
              </Link>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                Platform Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
