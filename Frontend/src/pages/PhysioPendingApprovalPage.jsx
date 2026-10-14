import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, ShieldCheck, CheckCircle2, LogOut, ArrowLeft, Mail, Phone } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const PhysioPendingApprovalPage = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser, loading: authLoading } = useAuth();
  const [checking, setChecking] = React.useState(false);
  const [statusText, setStatusText] = React.useState('');

  const handleCheckStatus = async () => {
    setChecking(true);
    setStatusText('');
    try {
      const updatedUser = await refreshUser();
      if (updatedUser && updatedUser.approvalStatus === 'APPROVED' && updatedUser.isApproved) {
        navigate('/doctor-dashboard', { replace: true });
      } else {
        setStatusText('Your account is still under Admin review. Please check back later or contact clinic reception.');
      }
    } catch (err) {
      setStatusText('Failed to verify status. Please try refreshing the page.');
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.role === 'physio') {
      if (user.registrationStatus === 'INCOMPLETE') {
        navigate('/physio/register', { replace: true });
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
              background: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              border: '4px solid #fde68a'
            }}>
              <Clock size={42} />
            </div>

            <span className="section-tag-teal" style={{ background: '#fef3c7', color: '#b45309' }}>
              ACCOUNT STATUS: PENDING
            </span>

            <h1 style={{ fontSize: '1.9rem', color: '#0f172a', margin: '0.75rem 0 0.5rem', fontWeight: '800' }}>
              Your account is awaiting admin approval
            </h1>

            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Your professional details have been registered successfully. Access to the Physiotherapist Dashboard, appointments, and patient features remains locked until an Administrator reviews and approves your account.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00b493', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={18} />
                <span>Approval Workflow</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.7' }}>
                <li>Step 1: Physiotherapist Registration Completed</li>
                <li>Step 2: Admin Verification & Credential Audit (In Progress)</li>
                <li>Step 3: Account Approval & Full Dashboard Unlocked</li>
              </ul>
            </div>

            {statusText && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {statusText}
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-teal"
                onClick={handleCheckStatus}
                disabled={checking}
                style={{ padding: '0.75rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>{checking ? 'Checking Status...' : 'Check Approval Status'}</span>
              </button>

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
                <Phone size={14} /> Reception: +91 7500831828
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

export default PhysioPendingApprovalPage;
