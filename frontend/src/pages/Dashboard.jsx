import React, { useState, useEffect } from 'react';
import { User, Mail, ShieldCheck, Key, Calendar, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Alert from '../components/Alert';
import authService from '../services/authService';

const Dashboard = () => {
  const { user, refreshUser, logout } = useAuth();
  const [profile, setProfile] = useState(user);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);

  // Fetch fresh profile details on mount
  useEffect(() => {
    let isMounted = true;
    const fetchFreshProfile = async () => {
      setLoadingProfile(true);
      setError(null);
      try {
        const data = await authService.getMe();
        if (isMounted && data?.success) {
          setProfile(data.user);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Session verification failed. Please re-authenticate.');
          // Auto-logout if token expired
          if (err.status === 401) {
            setTimeout(() => logout(), 1500);
          }
        }
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };

    fetchFreshProfile();
    return () => {
      isMounted = false;
    };
  }, [logout]);

  // Handle manual test of the protected GET /api/auth/me endpoint
  const handleTestProtectedEndpoint = async () => {
    setLoadingProfile(true);
    setApiResponse(null);
    setError(null);
    const startTime = performance.now();
    try {
      const data = await authService.getMe();
      const elapsed = Math.round(performance.now() - startTime);
      setApiResponse({
        status: 200,
        elapsed: `${elapsed}ms`,
        data
      });
      setProfile(data.user);
    } catch (err) {
      setError(err.message || 'Failed to communicate with protected API.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      <main className="dashboard-container">
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            style={{ marginBottom: '24px' }}
          />
        )}

        {/* Hero Section */}
        <div className="dashboard-hero">
          <div>
            <h1 className="dashboard-hero-title">Welcome back, {profile?.name || 'Authorized User'}</h1>
            <p className="dashboard-hero-subtitle">
              You are securely authenticated into the enterprise identity portal.
            </p>
          </div>
          <div className="status-chip">
            <span className="status-dot" />
            <span>Active Session (JWT Verified)</span>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="dashboard-grid">
          {/* Card 1: User Profile Info */}
          <section className="dashboard-card" aria-labelledby="profile-heading">
            <div className="card-header">
              <User size={20} color="var(--color-primary)" />
              <h2 id="profile-heading" className="card-title">User Profile Details</h2>
            </div>

            <div className="profile-field-list">
              <div className="profile-field-item">
                <span className="profile-field-label">Full Name</span>
                <span className="profile-field-value">{profile?.name || 'Loading...'}</span>
              </div>

              <div className="profile-field-item">
                <span className="profile-field-label">Registered Email</span>
                <span className="profile-field-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={15} color="var(--color-text-secondary)" />
                  {profile?.email || 'Loading...'}
                </span>
              </div>

              <div className="profile-field-item">
                <span className="profile-field-label">Account Identifier (MongoDB ID)</span>
                <span className="profile-field-value">
                  <code className="code-badge">{profile?.id || profile?._id || 'Loading...'}</code>
                </span>
              </div>

              <div className="profile-field-item">
                <span className="profile-field-label">Account Created</span>
                <span className="profile-field-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} color="var(--color-text-secondary)" />
                  {formatDate(profile?.createdAt)}
                </span>
              </div>
            </div>
          </section>

          {/* Card 2: Security & Authentication Overview */}
          <section className="dashboard-card" aria-labelledby="security-heading">
            <div className="card-header">
              <ShieldCheck size={20} color="var(--color-accent)" />
              <h2 id="security-heading" className="card-title">Security & Session</h2>
            </div>

            <div className="profile-field-list">
              <div className="profile-field-item">
                <span className="profile-field-label">Authentication Method</span>
                <span className="profile-field-value">JSON Web Token (JWT)</span>
              </div>

              <div className="profile-field-item">
                <span className="profile-field-label">Storage Architecture</span>
                <span className="profile-field-value">HttpOnly Cookie + Bearer Fallback</span>
              </div>

              <div className="profile-field-item">
                <span className="profile-field-label">Password Protection</span>
                <span className="profile-field-value">bcrypt salted hash (10 rounds)</span>
              </div>

              <div className="profile-field-item">
                <span className="profile-field-label">Live API Verification</span>
                <div style={{ marginTop: '8px' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleTestProtectedEndpoint}
                    loading={loadingProfile}
                    icon={RefreshCw}
                    style={{ width: 'auto', fontSize: '13px', padding: '6px 14px' }}
                  >
                    Ping Protected /api/auth/me
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Live API Response Inspector */}
        {apiResponse && (
          <div className="dashboard-card" style={{ marginTop: '24px' }}>
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle size={18} color="var(--color-success)" />
                <h3 className="card-title" style={{ fontSize: '15px' }}>
                  Live API Verification Response (Status {apiResponse.status})
                </h3>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                Response Time: {apiResponse.elapsed}
              </span>
            </div>
            <pre
              style={{
                backgroundColor: 'var(--color-bg)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '12.5px',
                overflowX: 'auto',
                border: '1px solid var(--color-border)',
                fontFamily: 'monospace'
              }}
            >
              {JSON.stringify(apiResponse.data, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

