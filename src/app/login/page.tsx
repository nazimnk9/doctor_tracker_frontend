'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldAlert, KeyRound, Mail } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="glass-card login-card">
        <div className="login-header">
          <div className="brand-logo">
            <Activity className="logo-icon" size={36} />
          </div>
          <h1>Doctor Tracker</h1>
          <p>Sign in to access the administrative portal</p>
        </div>

        {error && (
          <div className="error-alert">
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                className="form-input icon-padded"
                placeholder="admin@doctortracker.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-with-icon">
              <KeyRound className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                className="form-input icon-padded"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? <span className="button-loader"></span> : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials">
          <span className="demo-title">Demo Credentials:</span>
          <code>Email: admin@doctortracker.com</code>
          <code>Password: admin123</code>
        </div>
      </div>

      <style jsx>{`
        .login-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent),
                      radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.1), transparent),
                      var(--bg-primary);
          padding: 1.5rem;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 2.5rem;
          border-radius: var(--radius-lg);
          background: rgba(17, 24, 39, 0.75);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .brand-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: var(--radius-md);
          background-color: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          margin-bottom: 1rem;
        }

        .logo-icon {
          color: var(--accent-primary);
        }

        .login-header h1 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .login-header p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-sm);
          color: var(--accent-danger);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          pointer-events: none;
          transition: color var(--transition-fast);
        }

        .form-input.icon-padded {
          padding-left: 2.75rem;
        }

        .input-with-icon:focus-within .input-icon {
          color: var(--accent-primary);
        }

        .login-btn {
          width: 100%;
          padding: 0.875rem;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .button-loader {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
        }

        .demo-credentials {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .demo-title {
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .demo-credentials code {
          background-color: var(--bg-secondary);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          font-family: monospace;
          border: 1px solid rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
