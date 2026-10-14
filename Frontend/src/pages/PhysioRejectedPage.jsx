import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { XCircle, AlertTriangle, RefreshCw, LogOut, Phone, Mail, Edit3 } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const PhysioRejectedPage = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.role === 'physio') {
      if (user.registrationStatus === 'INCOMPLETE') {
        navigate('/physio/register', { replace: true });
      } else if (user.approvalStatus === 'PENDING') {
        navigate('/physio/pending-approval', { replace: true });
      } else if (user.approvalStatus === 'APPROVED' && user.isApproved) {
        navigate('/doctor-dashboard', { replace: true });
      }
    } else if (user.role === 'patient') {
      navigate('/patient-dashboard', { replace: true });
    } else if (user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, authLoading, navigate]);

  return (
    <div className="login-page-root">
      <Header />

      <section className="login-hero-section section-padding" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '680px' }}>
          <div className="login-glass-card" style={{ padding: '3rem 2.5rem', textAlign: 'center', borderRadius: '16px' }}>
            
            {/* Status Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '4px solid #fecaca'
            }}>
              <XCircle size={42} />
            </div>

            <span className="section-tag-teal" style={{ background: '#fef2f2', color: '#dc2626' }}>
              REGISTRATION ACTION REQUIRED
            </span>

            <h1 style={{ fontSize: '1.9rem', color: '#0f172a', margin: '0.75rem 0 0.5rem', fontWeight: '800' }}>
              Registration Review Update
            </h1>

            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Your professional registration was reviewed by our Admin team and requires updates before approval.
            </p>

            {/* Rejection Reason Box */}
            <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                <AlertTriangle size={18} />
                <span>Admin Rejection Reason:</span>
              </div>
              <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.95rem', fontWeight: '500' }}>
                "{user?.rejectionReason || 'Details provided do not meet administrative verification standards.'}"
              </p>
            </div>

            <p style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.95rem', marginBottom: '2rem' }}>
              You can update your professional details and upload revised documents for re-submission.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/physio/register"
                className="btn btn-teal"
                style={{ padding: '0.75rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Edit3 size={16} />
                <span>Update & Resubmit Details</span>
              </Link>

              <button
                className="btn btn-outline-dark"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                style={{ padding: '0.75rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Phone size={14} /> Desk: +91 7500831828
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Mail size={14} /> contact@satyaphyseo.com
              </span>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PhysioRejectedPage;
