import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRouter, Link } from '../../router/Router.jsx';

/**
 * Basic Administrator Dashboard
 * Displays authentic platform statistics, student accounts list,
 * and allows direct moderation actions (publish/unpublish, activate/suspend, delete).
 */
export function AdminDashboard() {
  const { user, logout, csrfToken } = useAuth();
  const { navigate } = useRouter();

  const [data, setData] = useState({
    totalStudents: 0,
    totalPortfolios: 0,
    publishedPortfolios: 0,
    draftPortfolios: 0,
    students: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/overview', {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          navigate('/admin/login');
          return;
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Failed to load dashboard data (${res.status})`);
      }

      const json = await res.json();
      setData({
        totalStudents: json.totalStudents || 0,
        totalPortfolios: json.totalPortfolios || 0,
        publishedPortfolios: json.publishedPortfolios || 0,
        draftPortfolios: json.draftPortfolios || 0,
        students: Array.isArray(json.students) ? json.students : []
      });
    } catch (err) {
      setError(err.message || 'Could not load administrative overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleToggleStatus = async (student) => {
    const nextStatus = student.status === 'active' ? 'suspended' : 'active';
    setActionLoadingId(student.id);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/students/${student.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        },
        body: JSON.stringify({ status: nextStatus })
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData?.error?.message || 'Failed to update account status.');
      }

      setActionMessage({
        type: 'success',
        text: `Student @${student.username} has been ${nextStatus === 'active' ? 'activated' : 'suspended'}.`
      });
      fetchOverview();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTogglePublish = async (student) => {
    setActionLoadingId(student.id);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/students/${student.id}/portfolio/toggle-publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || ''
        }
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData?.error?.message || 'Failed to update portfolio publishing state.');
      }

      setActionMessage({
        type: 'success',
        text: resData.message || 'Portfolio publishing status updated.'
      });
      fetchOverview();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete student @${student.username} and their portfolio? This action cannot be undone.`
    );
    if (!confirmed) return;

    setActionLoadingId(student.id);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken || ''
        }
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData?.error?.message || 'Failed to delete student.');
      }

      setActionMessage({
        type: 'success',
        text: `Student @${student.username} and their portfolio were permanently deleted.`
      });
      fetchOverview();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="admin-dashboard-wrapper" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Top Navigation */}
      <header className="navbar-wrapper">
        <div className="container">
          <div className="navbar-inner">
            <Link href="/admin" className="navbar-brand">
              <span className="brand-monogram" style={{ backgroundColor: 'var(--text-primary)', color: '#FFFFFF' }}>AD</span>
              <span className="brand-name">Administrator Control Panel</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Logged in as <strong>@{user?.username}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ maxWidth: '1080px', paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>
        {/* Action / Notification Banner */}
        {actionMessage && (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-6)',
              backgroundColor: actionMessage.type === 'error' ? '#FEF2F2' : '#ECFDF5',
              border: `1px solid ${actionMessage.type === 'error' ? '#FECACA' : '#A7F3D0'}`,
              color: actionMessage.type === 'error' ? '#B91C1C' : '#047857',
              fontSize: 'var(--font-size-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>{actionMessage.text}</span>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--text-primary)', margin: 0 }}>
              Platform Overview
            </h1>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Real-time student accounts and portfolio status stored in <code>data/portfolio-data.json</code>.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              type="button"
              onClick={fetchOverview}
              disabled={loading}
              className="btn btn-secondary btn-sm"
            >
              {loading ? 'Refreshing...' : '↻ Refresh Data'}
            </button>
            <Link href="/" className="btn btn-secondary btn-sm">
              Platform Home
            </Link>
          </div>
        </div>

        {/* Summary Statistics Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Total Students</span>
            <div className="admin-stat-number" style={{ color: 'var(--accent-blue)' }}>
              {data.totalStudents}
            </div>
            <span className="admin-stat-subtext">Registered student accounts</span>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-label">Total Portfolios</span>
            <div className="admin-stat-number" style={{ color: 'var(--text-primary)' }}>
              {data.totalPortfolios}
            </div>
            <span className="admin-stat-subtext">Provisioned portfolios</span>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-label">Published Portfolios</span>
            <div className="admin-stat-number" style={{ color: 'var(--color-success)' }}>
              {data.publishedPortfolios}
            </div>
            <span className="admin-stat-subtext">Live and publicly viewable</span>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-label">Draft Portfolios</span>
            <div className="admin-stat-number" style={{ color: 'var(--color-warning)' }}>
              {data.draftPortfolios}
            </div>
            <span className="admin-stat-subtext">Under student construction</span>
          </div>
        </div>

        {/* Student Accounts Table Card */}
        <div className="admin-table-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-primary)', margin: 0 }}>
              Student Accounts & Moderation
            </h2>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
              Showing {data.students.length} student{data.students.length === 1 ? '' : 's'}
            </span>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Moderate student publishing state, activate or suspend platform access, and manage student accounts.
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 'var(--space-3)' }} />
              <div>Loading platform students...</div>
            </div>
          ) : error ? (
            <div style={{ padding: 'var(--space-4)', backgroundColor: '#FEF2F2', color: '#B91C1C', borderRadius: 'var(--radius-md)', border: '1px solid #FECACA' }}>
              {error}
            </div>
          ) : data.students.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--text-secondary)' }}>
              No students have registered yet. Once students register, they will appear here.
            </div>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Username</th>
                    <th>Registered</th>
                    <th>Portfolio</th>
                    <th>Account Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((student) => {
                    const isPublished = Boolean(student.portfolio?.isPublished);
                    const isActive = student.status === 'active';
                    const isBusy = actionLoadingId === student.id;

                    return (
                      <tr key={student.id}>
                        <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                          {student.fullName}
                        </td>
                        <td>
                          <code style={{ fontSize: 'var(--font-size-xs)', padding: '2px 6px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                            @{student.username}
                          </code>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                          {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <span className={`badge-status ${isPublished ? 'badge-published' : 'badge-draft'}`}>
                            <span className={`badge-dot ${isPublished ? 'badge-dot-green' : 'badge-dot-amber'}`} />
                            {isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge-status ${isActive ? 'badge-active' : 'badge-suspended'}`}>
                            <span className={`badge-dot ${isActive ? 'badge-dot-green' : 'badge-dot-red'}`} />
                            {isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="admin-action-group" style={{ justifyContent: 'flex-end' }}>
                            {/* View Live Portfolio */}
                            {isPublished && isActive && (
                              <Link
                                href={`/p/${student.username}`}
                                className="btn btn-secondary btn-sm"
                                title="Open student public portfolio in new view"
                              >
                                View
                              </Link>
                            )}

                            {/* Publish / Unpublish Toggle */}
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(student)}
                              disabled={isBusy}
                              className="btn btn-secondary btn-sm"
                            >
                              {isPublished ? 'Unpublish' : 'Publish'}
                            </button>

                            {/* Suspend / Activate Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(student)}
                              disabled={isBusy}
                              className={`btn btn-secondary btn-sm ${isActive ? 'btn-danger' : ''}`}
                            >
                              {isActive ? 'Suspend' : 'Activate'}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDelete(student)}
                              disabled={isBusy}
                              className="btn btn-secondary btn-sm btn-danger"
                              title="Delete student account"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
