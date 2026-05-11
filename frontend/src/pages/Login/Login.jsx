import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
        const result = await loginUser({ email, password });
        localStorage.setItem('token', result.token);
        localStorage.setItem('role', result.role);

        if (result.role === 'admin') {
            navigate('/office/dashboard');
        } else {
            navigate('/office/contacts');
        }
    } catch (error) {
        setErrorMessage(error.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-brand">
          <img src="/logo.png" alt="RiseConnect" className="login-logo" />
          <h1 className="login-title">RiseConnect<span>CRM</span></h1>
          <p className="login-tagline">Bridging Mortgage & Real Estate professionals in one powerful platform.</p>
        </div>
        <div className="login-decoration">
          <div className="deco-circle c1"></div>
          <div className="deco-circle c2"></div>
          <div className="deco-circle c3"></div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {errorMessage && (
              <div className="error-banner">
                <svg className="error-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor"/>
                </svg>
                <span>{errorMessage}</span>
              </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="forgot-link">Forgot password?</span>
            </div>

            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>

          <div className="login-divider">
            <span>New to RiseConnect?</span>
          </div>

          <div className="register-options">
            <button className="register-btn" onClick={() => navigate('/register/office')}>I'm Mortgage Office</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;