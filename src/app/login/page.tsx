'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldAlert, KeyRound, Mail } from 'lucide-react';
import { validateEmail, validateRequired } from '../../utils/validation';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (errors.email) {
      const err = validateEmail(val);
      setErrors((prev) => {
        const next = { ...prev };
        if (!err) delete next.email;
        else next.email = err;
        return next;
      });
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (errors.password) {
      const err = validateRequired(val);
      setErrors((prev) => {
        const next = { ...prev };
        if (!err) delete next.password;
        else next.password = err;
        return next;
      });
    }
  };

  const handleEmailBlur = () => {
    const err = validateEmail(email);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next.email = err;
      else delete next.email;
      return next;
    });
  };

  const handlePasswordBlur = () => {
    const err = validateRequired(password);
    setErrors((prev) => {
      const next = { ...prev };
      if (err) next.password = err;
      else delete next.password;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailErr = validateEmail(email);
    const passErr = validateRequired(password);

    const valErrors: Record<string, string> = {};
    if (emailErr) valErrors.email = emailErr;
    if (passErr) valErrors.password = passErr;

    setErrors(valErrors);

    if (Object.keys(valErrors).length > 0) {
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

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div className="input-with-icon">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                className={`form-input icon-padded ${errors.email ? 'input-error' : ''}`}
                placeholder="admin@doctortracker.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                disabled={loading}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
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
                className={`form-input icon-padded ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={handlePasswordBlur}
                disabled={loading}
              />
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
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
