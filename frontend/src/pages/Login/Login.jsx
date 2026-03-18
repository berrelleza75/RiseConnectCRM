import React, { useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">RC</div>
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
            <button className="register-btn" onClick={() => navigate('/register/realtor')}>I'm Realtor</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;