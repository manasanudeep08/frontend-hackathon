import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRouter, Link } from '../../router/Router.jsx';

/**
 * Reusable Login Form for Students and Administrator
 * Adheres strictly to the established minimal light-mode design language.
 *
 * @param {{ isAdmin?: boolean }} props
 */
export function LoginForm({ isAdmin = false }) {
  const { login, logout } = useAuth();
  const { navigate } = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim();
    if (!cleanUser || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await login(cleanUser, password);

      if (isAdmin) {
        if (data.user.role !== 'admin') {
          await logout();
          setError('Access denied. Student accounts cannot access the administrative portal.');
          setIsSubmitting(false);
          return;
        }
        navigate('/admin');
      } else {
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="container" style={{ maxWidth: '460px', paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-16)' }}>
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
                backgroundColor: isAdmin ? 'var(--bg-secondary)' : 'var(--accent-blue-light)',
                color: isAdmin ? 'var(--text-primary)' : 'var(--accent-blue)',
                border: `1px solid ${isAdmin ? 'var(--border-color)' : 'var(--accent-blue-border)'}`,
                marginBottom: 'var(--space-3)',
                fontWeight: 'bold',
                fontSize: 'var(--font-size-xl)'
              }}
            >
              {isAdmin ? 'AD' : 'P'}
            </div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
              {isAdmin ? 'Administrator Access' : 'Student Login'}
            </h1>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {isAdmin
                ? 'Sign in with your configured administrator credentials.'
                : 'Sign in to access your portfolio dashboard and builder.'}
            </p>
          </div>

          {/* Error Notice */}
          {error && (
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
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span aria-hidden="true" style={{ fontWeight: 'bold' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="login-username" className="form-label" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Username
              </label>
              <input
                id="login-username"
                type="text"
                className="form-input"
                placeholder={isAdmin ? 'admin_username' : 'your_username'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 'var(--space-5)' }}>
              <label htmlFor="login-password" className="form-label" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isSubmitting}
                required
              />
            </div>

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
                  Signing in...
                </span>
              ) : (
                isAdmin ? 'Enter Admin Panel' : 'Sign In'
              )}
            </button>
          </form>

          {/* Navigational Footer */}
          <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
            {!isAdmin ? (
              <>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Don't have an account yet?{' '}
                  <Link href="/register" style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--accent-blue)' }}>
                    Create Portfolio Account
                  </Link>
                </p>
                <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                  Looking for administrator access?{' '}
                  <Link href="/admin/login" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                    Admin Login
                  </Link>
                </p>
              </>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Protected administrative gateway. Unauthorized access is strictly logged.
                </p>
                <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                  Looking for student access?{' '}
                  <Link href="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                    Student Login
                  </Link>
                </p>
              </>
            )}
            <div style={{ marginTop: 'var(--space-4)' }}>
              <Link href="/" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                ← Return to Platform Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
