import React, { useEffect, Suspense, lazy } from 'react';
import { Router, useRouter, Link } from './router/Router.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { PlatformHome } from './components/home/PlatformHome.jsx';
import { LoginForm } from './components/auth/LoginForm.jsx';
import { RegisterForm } from './components/auth/RegisterForm.jsx';
import { StudentDashboard } from './components/student/StudentDashboard.jsx';
import { AdminDashboard } from './components/admin/AdminDashboard.jsx';

// Route-level code-splitting
const DemoPortfolio = lazy(() =>
  import('./components/demo/DemoPortfolio.jsx').then((m) => ({ default: m.DemoPortfolio }))
);

const StudentPortfolioBuilder = lazy(() =>
  import('./components/builder/StudentPortfolioBuilder.jsx').then((m) => ({ default: m.StudentPortfolioBuilder }))
);

const StudentPreviewPage = lazy(() =>
  import('./components/preview/StudentPreviewPage.jsx').then((m) => ({ default: m.StudentPreviewPage }))
);

const PublicPortfolioPage = lazy(() =>
  import('./components/portfolio/PublicPortfolioPage.jsx').then((m) => ({ default: m.PublicPortfolioPage }))
);

/**
 * Accessible route loading indicator during dynamic import resolution.
 */
function RouteFallback({ message = 'Loading showcase...' }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          {message}
        </p>
      </div>
    </div>
  );
}

/**
 * Route Guard Component
 * Enforces authentication and role-based access control.
 * Displays an accessible loading state while verifying sessions.
 */
function ProtectedRoute({ requiredRole, children }) {
  const { user, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(requiredRole === 'admin' ? '/admin/login' : '/login', { replace: true });
      } else if (user.role !== requiredRole) {
        navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      }
    }
  }, [user, loading, requiredRole, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== requiredRole) {
    return null;
  }

  return children;
}

/**
 * Public Authentication Route Guard
 * Prevents already-authenticated users from re-entering login/register pages.
 */
function PublicAuthRoute({ children, isAdmin = false }) {
  const { user, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!loading && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return null;
  }

  if (user) {
    return null;
  }

  return children;
}

/**
 * Main Application Dispatcher
 */
function AppContent() {
  const { currentPath } = useRouter();

  useEffect(() => {
    if (!currentPath.startsWith('/p/')) {
      document.title = 'Personal Portfolio Website';
    }
  }, [currentPath]);

  if (currentPath === '/') {
    return <PlatformHome />;
  }

  if (currentPath === '/demo') {
    return (
      <Suspense fallback={<RouteFallback message="Loading demo showcase..." />}>
        <DemoPortfolio />
      </Suspense>
    );
  }

  if (currentPath === '/login') {
    return (
      <PublicAuthRoute>
        <LoginForm isAdmin={false} />
      </PublicAuthRoute>
    );
  }

  if (currentPath === '/register') {
    return (
      <PublicAuthRoute>
        <RegisterForm />
      </PublicAuthRoute>
    );
  }

  if (currentPath === '/admin/login') {
    return (
      <PublicAuthRoute isAdmin={true}>
        <LoginForm isAdmin={true} />
      </PublicAuthRoute>
    );
  }

  if (currentPath === '/dashboard') {
    return (
      <ProtectedRoute requiredRole="student">
        <StudentDashboard />
      </ProtectedRoute>
    );
  }

  if (currentPath === '/builder') {
    return (
      <ProtectedRoute requiredRole="student">
        <Suspense fallback={<RouteFallback message="Loading portfolio builder..." />}>
          <StudentPortfolioBuilder />
        </Suspense>
      </ProtectedRoute>
    );
  }

  if (currentPath === '/preview') {
    return (
      <ProtectedRoute requiredRole="student">
        <Suspense fallback={<RouteFallback message="Loading portfolio preview..." />}>
          <StudentPreviewPage />
        </Suspense>
      </ProtectedRoute>
    );
  }

  if (currentPath === '/admin') {
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    );
  }

  // Dynamic public portfolio route: /p/:username
  if (currentPath.startsWith('/p/')) {
    const username = currentPath.slice(3).split('/')[0].trim();
    if (username) {
      return (
        <Suspense fallback={<RouteFallback message="Loading student portfolio..." />}>
          <PublicPortfolioPage username={username} />
        </Suspense>
      );
    }
  }

  // Fallback 404
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="contact-card" style={{ maxWidth: '480px', textAlign: 'center', padding: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-2)' }}>404</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
          The requested page could not be found.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
          <Link href="/" className="btn btn-primary btn-sm">
            Platform Home
          </Link>
          <Link href="/demo" className="btn btn-secondary btn-sm">
            Demo Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
