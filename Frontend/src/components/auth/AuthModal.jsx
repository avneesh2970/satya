import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, Mail, Phone, User, LogIn, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(formData.email, formData.password);
        setSuccess('Logged in successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
          throw new Error('Please fill in all fields');
        }
        await register(formData.name, formData.email, formData.phone, formData.password);
        setSuccess('Account created successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-title">
            <span className="serif-italic-teal" style={{ fontSize: '1.4rem' }}>Satya Clinic</span>
            <h2>{activeTab === 'login' ? 'Patient Portal Access' : 'Create Patient Account'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('login');
              setError('');
              setSuccess('');
            }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
          <button
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('register');
              setError('');
              setSuccess('');
            }}
          >
            <UserPlus size={16} />
            <span>New Patient Registration</span>
          </button>
        </div>

        {/* Feedback Banners */}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="auth-form">
          {activeTab === 'register' && (
            <div className="form-group">
              <label>Full Name *</label>
              <div className="input-icon-wrap">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address *</label>
            <div className="input-icon-wrap">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {activeTab === 'register' && (
            <div className="form-group">
              <label>Contact Phone *</label>
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
          )}

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

          <button type="submit" className="btn btn-teal auth-submit-btn" disabled={loading}>
            {loading ? (
              <span>Processing...</span>
            ) : activeTab === 'login' ? (
              <>
                <LogIn size={18} />
                <span>Sign In to Portal</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register Patient Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="auth-modal-footer">
          <p>
            {activeTab === 'login' ? (
              <>
                Don't have a patient account?{' '}
                <button type="button" className="text-teal-btn" onClick={() => setActiveTab('register')}>
                  Register Now
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button type="button" className="text-teal-btn" onClick={() => setActiveTab('login')}>
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
