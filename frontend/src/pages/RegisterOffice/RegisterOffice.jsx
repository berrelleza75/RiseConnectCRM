import React, { useState, useEffect } from 'react';
import './RegisterOffice.css';
import { useNavigate } from 'react-router-dom';
import { registerOffice } from '../../services/authService';

function RegisterOffice() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const result = await registerOffice(form);
      console.log(result);
      setIsSuccess(true);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    if (!isSuccess) return;

    if (countdown === 0) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isSuccess, countdown, navigate]);

  return (
    <div className="register-wrapper">
      <div className="register-left">
        <div className="register-brand">
          <img src="/logo.png" alt="RiseConnect" className="login-logo" />
          <h1 className="register-title">RiseConnect<span>CRM</span></h1>
          <p className="register-tagline">The all-in-one platform for Mortgage professionals.</p>
        </div>
        <div className="register-decoration">
          <div className="deco-circle c1"></div>
          <div className="deco-circle c2"></div>
          <div className="deco-circle c3"></div>
        </div>
      </div>

      <div className="register-right">
        {!isSuccess ? (
          <div className="register-form-container">
            <div className="register-form-header">
              <h2>Create your account</h2>
              <p>Set up your Mortgage Office on RiseConnect</p>
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

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="register-btn-submit">
                Create Account
              </button>
              <button type="button" className="back-btn" onClick={() => navigate('/')}>Back to Login</button>
            </form>

            <div className="register-footer">
              <span>Already have an account? </span>
              <a href="/">Sign in</a>
            </div>
          </div>
        ) : (
          <div className="success-container">
            <div className="success-checkmark">
              <svg viewBox="0 0 52 52">
                <circle className="success-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="success-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>

            <h2 className="success-title">Registration successful</h2>
            <p className="success-message">Your Mortgage Office account has been created.</p>

            <div className="success-redirect">
              <p className="success-redirect-text">
                You will be redirected to login in
              </p>
              <div className="success-countdown">
                <span className="countdown-number">{countdown}</span>
                <span className="countdown-label">{countdown === 1 ? 'second' : 'seconds'}</span>
              </div>
            </div>

            <button
              type="button"
              className="success-btn"
              onClick={() => navigate('/')}
            >
              Continue to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterOffice;