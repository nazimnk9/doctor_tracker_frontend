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
    </div>
  );
}
