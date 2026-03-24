import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterRealtor.css';
import { registerRealtor } from '../../services/authService';

function RegisterRealtor() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const result = await registerRealtor(form);
        console.log(result);
        navigate('/');
    } catch (error) {
        alert(error.message);
    }
  };

  return (
    <div className="register-realtor-wrapper">
      <div className="register-realtor-left">
        <div className="register-realtor-brand">
          <div className="register-realtor-logo">RC</div>
          <h1 className="register-realtor-title">RiseConnect<span>CRM</span></h1>
          <p className="register-realtor-tagline">Connect with top Mortgage professionals and grow your real estate business.</p>
        </div>
        <div className="register-realtor-decoration">
          <div className="deco-circle c1"></div>
          <div className="deco-circle c2"></div>
          <div className="deco-circle c3"></div>
        </div>
      </div>

      <div className="register-realtor-right">
        <div className="register-realtor-form-container">
          <div className="register-realtor-form-header">
            <h2>Join as a Realtor</h2>
            <p>Create your free account and start connecting</p>
          </div>

          <form onSubmit={handleSubmit} className="register-realtor-form">
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

            <button type="submit" className="register-realtor-btn-submit">
              Create Account
            </button>

            <button type="button" className="back-btn-realtor" onClick={() => navigate('/')}>
              ← Back to Login
            </button>
          </form>

          <div className="register-realtor-footer">
            <span>Already have an account? </span>
            <a href="/">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterRealtor;