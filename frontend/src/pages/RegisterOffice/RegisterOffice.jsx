import React, { useState } from 'react';
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

  const navigate = useNavigate();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const result = await registerOffice(form);
        console.log(result);
        navigate('/'); // redirige al login
    } catch (error) {
        alert(error.message);
    }
  };

  return (
    <div className="register-wrapper">
        <div className="register-left">
        <div className="register-brand">
          <div className="register-logo">RC</div>
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
        <div className="register-form-container">
          <div className="register-form-header">
            <h2>Create your account</h2>
            <p>Set up your Mortgage Office on RiseConnect</p>
          </div>

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
            <button className="back-btn" onClick={() => navigate('/')}>Back to Login</button>
          </form>

          <div className="register-footer">
            <span>Already have an account? </span>
            <a href="/">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterOffice;