import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, UserPlus, AlertCircle, CheckCircle2, ShieldCheck, Stethoscope, ArrowRight } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const PhysioSignupPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user, loading: authLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle post-signup or existing user redirect
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && user) {
      if (user.role === 'physio') {
        if (user.registrationStatus === 'INCOMPLETE') {
          navigate('/physio/register', { replace: true });
        } else if (user.approvalStatus === 'PENDING') {
          navigate('/physio/pending-approval', { replace: true });
        } else if (user.approvalStatus === 'REJECTED') {
          navigate('/physio/rejected', { replace: true });
        } else if (user.approvalStatus === 'APPROVED' && user.isApproved) {
          navigate('/doctor-dashboard', { replace: true });
        }
      } else if (user.role === 'patient') {
        navigate('/patient-dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Step 1 Validation
    if (!formData.name.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email Address is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone Number is required');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your confirm password.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.phone.trim(),
        formData.password,
        'physio' // role: "physio"
      );

      setSuccess('Account created successfully! Redirecting to Professional Registration...');
      setTimeout(() => {
        navigate('/physio/register', { replace: true });
      }, 600);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again with a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      <Header />

      <section className="login-hero-section section-padding">
        <div className="container login-container">
          {/* Left Column: Brand & Physio Benefits */}
          <div className="login-left-content">
            <span className="section-tag-teal">PRACTITIONER ONBOARDING</span>
            <h1 className="login-title">
              Join Our Network of <br />
              <span className="serif-italic-teal">Expert Physiotherapists</span>
            </h1>
            <p className="login-sub">
              Expand your clinical reach, manage online patient consultation reviews, and collaborate with leading orthopedic and sports rehabilitation specialists.
            </p>

            <div className="login-highlights-list">
              <div className="highlight-item">
                <div className="h-icon-teal"><Stethoscope size={22} /></div>
                <div>
                  <strong>Dedicated Specialist Portal</strong>
                  <p>Seamlessly receive patient appointment requests and MRI/report reviews.</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="h-icon-teal"><ShieldCheck size={22} /></div>
                <div>
                  <strong>Verified Clinical Credentials</strong>
                  <p>Gain trust with verified Council registration and experience badges.</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="h-icon-teal"><UserPlus size={22} /></div>
                <div>
                  <strong>Quick 2-Step Onboarding</strong>
                  <p>Step 1: Account Signup → Step 2: Professional Verification Details.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Physio Signup Card */}
          <div className="login-card-wrapper">
            <div className="login-glass-card">
              <div className="login-card-header">
                <span className="serif-italic-teal" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Satya Care</span>
                <h2>Physio Registration — Step 1 of 2</h2>
                <p>Create your practitioner account to begin professional registration.</p>
              </div>

              {error && (
                <div className="auth-alert alert-error">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="auth-alert alert-success">
                  <CheckCircle2 size={18} />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                {/* 1. Full Name */}
                <div className="form-group">
                  <label>Full Name *</label>
                  <div className="input-icon-wrap">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Dr. Satya Prakash"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 2. Email Address */}
                <div className="form-group">
                  <label>Email Address *</label>
                  <div className="input-icon-wrap">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="physio@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 3. Phone Number */}
                <div className="form-group">
                  <label>Phone Number *</label>
                  <div className="input-icon-wrap">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 4. Password */}
                <div className="form-group">
                  <label>Password *</label>
                  <div className="input-icon-wrap">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      minLength="6"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      style={{ paddingRight: '2.6rem' }}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password"}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* 5. Confirm Password */}
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <div className="input-icon-wrap">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      minLength="6"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      style={{ paddingRight: '2.6rem' }}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-teal auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <span>Creating Physio Account...</span>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Register & Continue to Step 2</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="auth-modal-footer">
                <p>
                  Already registered as a Physio?{' '}
                  <Link to="/login" className="text-teal-btn">
                    Sign In Here
                  </Link>
                </p>
                <p style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}>
                  Are you a Patient?{' '}
                  <Link to="/login?tab=register" style={{ color: '#00b493', textDecoration: 'underline' }}>
                    Patient Signup
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PhysioSignupPage;
