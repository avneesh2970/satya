import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, LogIn, UserPlus, CheckCircle2, AlertCircle, ShieldCheck, HeartHandshake, Award, Calendar } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const bookingState = location.state;

  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'patient'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const getRoleRedirectPath = (loggedUser) => {
    if (!loggedUser) return '/login';
    const role = loggedUser.role;
    if (role === 'physio') {
      if (loggedUser.registrationStatus === 'INCOMPLETE') {
        return '/physio/register';
      }
      if (loggedUser.approvalStatus === 'PENDING') {
        return '/physio/pending-approval';
      }
      if (loggedUser.approvalStatus === 'REJECTED') {
        return '/physio/rejected';
      }
      if (loggedUser.approvalStatus === 'APPROVED' && loggedUser.isApproved) {
        return '/doctor-dashboard';
      }
      return '/physio/pending-approval';
    }
    if (role === 'doctor') return '/doctor-dashboard';
    if (role === 'admin') return '/admin';
    return '/patient-dashboard';
  };

  const handlePostAuthRedirect = (loggedUser) => {
    if (bookingState?.fromBooking) {
      const targetPath = bookingState.returnUrl || (loggedUser?.role === 'patient' ? '/' : getRoleRedirectPath(loggedUser));
      navigate(targetPath, {
        state: {
          autoOpenBooking: true,
          bookingType: bookingState.bookingType || 'in-person',
          preselectedDoctor: bookingState.preselectedDoctor,
          serviceName: bookingState.serviceName
        }
      });
    } else {
      navigate(getRoleRedirectPath(loggedUser));
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      handlePostAuthRedirect(user);
    }
  }, [authLoading, isAuthenticated, user]);

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
        const res = await login(formData.email, formData.password);
        const loggedUser = res.data;
        setSuccess(`Signed in successfully! Returning to appointment booking...`);
        setTimeout(() => {
          handlePostAuthRedirect(loggedUser);
        }, 600);
      } else {
        if (!formData.name || !formData.email || !formData.phone || !formData.password) {
          throw new Error('Please fill in all required fields');
        }
        const res = await register(formData.name, formData.email, formData.phone, formData.password, formData.role);
        const registeredUser = res.data;
        setSuccess('Account created successfully! Returning to appointment booking...');
        setTimeout(() => {
          handlePostAuthRedirect(registeredUser);
        }, 600);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      <Header />

      {/* Main Dedicated Sign In Section */}
      <section className="login-hero-section section-padding">
        <div className="container login-container">
          
          {/* Left Column: Brand Story & Values */}
          <div className="login-left-content">
            <span className="section-tag-teal">PATIENT PORTAL ACCESS</span>
            <h1 className="login-title">
              Your Personal Path to <br />
              <span className="serif-italic-teal">Pain-Free Living</span>
            </h1>
            <p className="login-sub">
              Access your personalized therapy plans, track recovery milestones, schedule in-person clinic visits, and submit online report reviews with our senior physical therapists.
            </p>

            <div className="login-highlights-list">
              <div className="highlight-item">
                <div className="h-icon-teal"><ShieldCheck size={22} /></div>
                <div>
                  <strong>Direct 1-on-1 Specialist Care</strong>
                  <p>Book priority consultation slots with Dr. Satya Prakash & team.</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="h-icon-teal"><Award size={22} /></div>
                <div>
                  <strong>Online Report Reviews</strong>
                  <p>Upload MRI, X-Rays, and prescriptions for non-surgical analysis.</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="h-icon-teal"><HeartHandshake size={22} /></div>
                <div>
                  <strong>Transparent Progress Tracking</strong>
                  <p>View your past visits, active exercise guides, and notifications.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dedicated Authentication Card */}
          <div className="login-card-wrapper">
            <div className="login-glass-card">
              <div className="login-card-header">
                <span className="serif-italic-teal" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>Satya Care</span>
                <h2>{activeTab === 'login' ? 'Patient Sign In' : 'New Patient Registration'}</h2>
                <p>Please enter your credentials to access your patient portal.</p>
              </div>

              {bookingState?.fromBooking && (
                <div className="auth-alert" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Calendar size={18} style={{ flexShrink: 0, color: '#059669' }} />
                  <span>Please sign in or register to proceed with your appointment booking.</span>
                </div>
              )}

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
                  <span>New Registration</span>
                </button>
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

              {/* Form */}
              <form onSubmit={handleSubmit} className="auth-form">
                {activeTab === 'register' && (
                  <>
                    <div className="form-group">
                      <label>Account Type *</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button
                          type="button"
                          className={`btn ${formData.role === 'patient' ? 'btn-teal' : 'btn-outline-dark'}`}
                          onClick={() => setFormData({ ...formData, role: 'patient' })}
                          style={{ padding: '0.65rem 0.5rem', fontSize: '0.85rem' }}
                        >
                          Patient Account
                        </button>
                        <button
                          type="button"
                          className={`btn ${formData.role === 'physio' || formData.role === 'doctor' ? 'btn-teal' : 'btn-outline-dark'}`}
                          onClick={() => navigate('/physio/signup')}
                          style={{ padding: '0.65rem 0.5rem', fontSize: '0.85rem' }}
                        >
                          Physiotherapist Signup
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Full Name *</label>
                      <div className="input-icon-wrap">
                        <User size={18} className="input-icon" />
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder={formData.role === 'doctor' ? 'e.g. Dr. Satya Prakash' : 'e.g. Ramesh Verma'}
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </>
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
                    <label>Contact Phone Number *</label>
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
                    <span>Authenticating...</span>
                  ) : activeTab === 'login' ? (
                    <>
                      <LogIn size={18} />
                      <span>Sign In to Dashboard</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      <span>Register</span>
                    </>
                  )}
                </button>
              </form>

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

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LoginPage;
