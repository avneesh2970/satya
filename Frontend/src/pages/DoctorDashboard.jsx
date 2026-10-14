import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Calendar, Clock, User, Phone, Mail, FileText, Bell, Lock, Home,
  Search, Plus, CheckCircle2, AlertCircle, X, Menu, ShieldCheck,
  Video, MapPin, LogOut, ArrowRight, RefreshCw, Check, Edit3, Award, Stethoscope, DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Pagination from '../components/common/Pagination';
import '../styles/admin.css';

const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const backendBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : 'http://localhost:5000';
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

const DoctorDashboard = () => {
  const { user, logout, refreshUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getTabFromUrl = () => {
    let rawTab = searchParams.get('tab');
    if (!rawTab) {
      const pathParts = location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 1 && pathParts[0] === 'doctor-dashboard') {
        rawTab = pathParts[1];
      }
    }
    if (!rawTab) return 'overview';
    if (rawTab === 'patients' || rawTab === 'appointments') return 'requests';
    return rawTab;
  };

  const [activeTab, setActiveTabState] = useState(getTabFromUrl);

  const markNotificationsAsReadIfNeeded = (tabName) => {
    if (tabName !== 'notifications') {
      setNotifications((prev) => {
        const hasUnread = prev.some((n) => !n.read);
        if (hasUnread) {
          api.markAllNotificationsRead().catch((err) => {
            console.error("Failed to mark notifications as read on tab switch:", err);
          });
          return prev.map((n) => ({ ...n, read: true }));
        }
        return prev;
      });
    }
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const setActiveTab = (newTab, replace = false) => {
    setStatusMsg({ type: '', text: '' });
    setActiveTabState(newTab);
    setSearchParams({ tab: newTab }, { replace });
    setMobileSidebarOpen(false);
    markNotificationsAsReadIfNeeded(newTab);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.role === 'physio' || user.role === 'doctor') {
      if (user.role === 'physio' && user.registrationStatus === 'INCOMPLETE') {
        navigate('/physio/register', { replace: true });
        return;
      }
      if (user.approvalStatus === 'PENDING' || (user.role === 'physio' && !user.isApproved)) {
        navigate('/physio/pending-approval', { replace: true });
        return;
      }
      if (user.approvalStatus === 'REJECTED') {
        navigate('/physio/rejected', { replace: true });
        return;
      }
      if (user.role === 'physio' && (user.approvalStatus !== 'APPROVED' || !user.isApproved)) {
        navigate('/physio/pending-approval', { replace: true });
        return;
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const urlTab = getTabFromUrl();
    if (urlTab !== activeTab) {
      setStatusMsg({ type: '', text: '' });
      setActiveTabState(urlTab);
      markNotificationsAsReadIfNeeded(urlTab);
    }
  }, [location.pathname, location.search]);

  const [appointments, setAppointments] = useState([]);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Auto-dismiss status message after 5 seconds
  useEffect(() => {
    if (statusMsg.text) {
      const timer = setTimeout(() => {
        setStatusMsg({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg.text]);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    qualification: 'MPT (Orthopedics)',
    experienceYears: 10,
    specialization: 'Spine & Joint Rehabilitation',
    servicesOffered: ['Orthopedic Rehabilitation', 'Sports Injury Care', 'Post-Operative Rehab', 'Spine Therapy', 'Home Physiotherapy'],
    consultationFee: '₹800',
    availableSlots: ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM', '05:30 PM'],
    bio: 'Dedicated physical therapy specialist focused on non-surgical recovery and movement rehabilitation.'
  });

  const [notifications, setNotifications] = useState([]);
  const [patientHistory, setPatientHistory] = useState([]);
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Reschedule Modal State
  const [rescheduleModal, setRescheduleModal] = useState({
    isOpen: false,
    aptId: null,
    date: '',
    timeSlot: '10:00 AM'
  });

  // Cancel/Reject Modal State
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    aptId: null,
    reason: ''
  });

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    setLoading(true);
    try {
      const [profRes, aptsRes, notifRes, historyRes] = await Promise.all([
        api.getDoctorProfile(),
        api.getDoctorAppointments(),
        api.getNotifications().catch(() => ({ data: [] })),
        api.getDoctorPatientHistory().catch(() => ({ data: [] }))
      ]);

      let loadedNotifs = notifRes.data || [];
      const currentTab = getTabFromUrl();
      if (currentTab !== 'notifications' && loadedNotifs.some((n) => !n.read)) {
        api.markAllNotificationsRead().catch((err) => {
          console.error("Failed to mark notifications as read on initial load:", err);
        });
        loadedNotifs = loadedNotifs.map((n) => ({ ...n, read: true }));
      }

      if (profRes.data) {
        setProfile(profRes.data);
      }
      setAppointments(aptsRes.data || []);
      setNotifications(loadedNotifs);
      setPatientHistory(historyRes.data || []);
    } catch (err) {
      console.error("Failed to load doctor dashboard data:", err);
      if (err.code === 'APPROVAL_PENDING' || err.status === 403 || (err.message && err.message.includes('awaiting admin approval'))) {
        navigate('/physio/pending-approval', { replace: true });
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptByDoctor = async (id) => {
    setStatusMsg({ type: '', text: '' });
    try {
      await api.acceptDoctorAppointment(id);
      setStatusMsg({ type: 'success', text: 'Appointment request accepted & confirmed!' });
      loadDoctorData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to accept appointment' });
    }
  };

  const handleRejectByDoctor = async (id) => {
    const reason = window.prompt("Enter rejection reason for patient (optional):");
    if (reason === null) return;
    setStatusMsg({ type: '', text: '' });
    try {
      await api.rejectDoctorAppointment(id, reason);
      setStatusMsg({ type: 'success', text: 'Appointment request declined.' });
      loadDoctorData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to reject appointment' });
    }
  };

  const handleUpdateStatus = async (id, status, note = '') => {
    setStatusMsg({ type: '', text: '' });
    try {
      await api.updateAppointmentStatus(id, status, note);
      setStatusMsg({ type: 'success', text: `Appointment marked as ${status} successfully!` });
      loadDoctorData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update status' });
    }
  };

  const handleTogglePayment = async (id, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    setStatusMsg({ type: '', text: '' });
    try {
      await api.updatePaymentStatus(id, newStatus);
      setStatusMsg({ type: 'success', text: `Payment status updated to ${newStatus.toUpperCase()}` });
      loadDoctorData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update payment' });
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleModal.date || !rescheduleModal.timeSlot) return;
    setStatusMsg({ type: '', text: '' });
    try {
      await api.rescheduleDoctorAppointment(rescheduleModal.aptId, rescheduleModal.date, rescheduleModal.timeSlot);
      setStatusMsg({ type: 'success', text: 'Appointment rescheduled successfully!' });
      setRescheduleModal({ isOpen: false, aptId: null, date: '', timeSlot: '10:00 AM' });
      loadDoctorData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to reschedule' });
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModal.aptId) return;
    try {
      await handleUpdateStatus(cancelModal.aptId, 'cancelled', cancelModal.reason);
      setCancelModal({ isOpen: false, aptId: null, reason: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setRemoveAvatarFlag(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setRemoveAvatarFlag(true);
    setProfile((prev) => ({ ...prev, avatar: '' }));
    const fileInput = document.getElementById('physioAvatarFileInput');
    if (fileInput) fileInput.value = '';
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });
    try {
      const payload = new FormData();
      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }
      if (removeAvatarFlag) {
        payload.append('removeAvatar', 'true');
        payload.append('avatar', '');
      }
      payload.append('name', profile.name || '');
      payload.append('qualification', profile.qualification || '');
      payload.append('experienceYears', profile.experienceYears || 0);
      payload.append('specialization', profile.specialization || '');
      payload.append('consultationFee', profile.consultationFee || '');
      payload.append('servicesOffered', Array.isArray(profile.servicesOffered) ? profile.servicesOffered.join(', ') : (profile.servicesOffered || ''));
      payload.append('availableSlots', Array.isArray(profile.availableSlots) ? profile.availableSlots.join(', ') : (profile.availableSlots || ''));
      payload.append('bio', profile.bio || '');

      const res = await api.updateDoctorProfile(payload);
      if (res.data) setProfile(res.data);
      setAvatarFile(null);
      setAvatarPreview('');
      setRemoveAvatarFlag(false);
      setStatusMsg({ type: 'success', text: 'Clinical Credentials & Profile Photo updated successfully!' });
      if (refreshUser) await refreshUser();
      loadDoctorData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif || notif.read) return;
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
      );
      await api.markNotificationRead(notif._id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: false } : n))
      );
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await api.markAllNotificationsRead();
      setStatusMsg({ type: 'success', text: 'All system notifications marked as read!' });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'SP';
    const cleanName = name.replace(/^Dr\.\s*/i, '').trim();
    const parts = cleanName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  };

  const todayAppointments = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'upcoming');
  const pendingRequests = appointments.filter(a => a.status === 'PENDING_PHYSIOTHERAPIST_APPROVAL');
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const [pageReqs, setPageReqs] = useState(1);
  const [pageHistory, setPageHistory] = useState(1);
  const [pageNotifs, setPageNotifs] = useState(1);

  useEffect(() => {
    setPageReqs(1);
  }, [searchTerm, statusFilter, typeFilter]);

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch =
      (a.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.phone || '').includes(searchTerm) ||
      (a.service || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && a.status === 'PENDING_PHYSIOTHERAPIST_APPROVAL') ||
      (statusFilter === 'CONFIRMED' && (a.status === 'CONFIRMED' || a.status === 'upcoming')) ||
      (statusFilter === 'COMPLETED' && a.status === 'completed') ||
      (statusFilter === 'REJECTED' && (a.status === 'REJECTED_BY_PHYSIOTHERAPIST' || a.status === 'cancelled'));

    const matchesType =
      typeFilter === 'ALL' ||
      (typeFilter === 'clinic' && a.appointmentType !== 'home') ||
      (typeFilter === 'home' && a.appointmentType === 'home');

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalReqPages = Math.ceil(filteredAppointments.length / 10);
  const paginatedRequests = filteredAppointments.slice((pageReqs - 1) * 10, pageReqs * 10);

  const totalHistoryPages = Math.ceil(completedAppointments.length / 10);
  const paginatedHistory = completedAppointments.slice((pageHistory - 1) * 10, pageHistory * 10);

  const totalNotifPages = Math.ceil(notifications.length / 10);
  const paginatedNotifs = notifications.slice((pageNotifs - 1) * 10, pageNotifs * 10);

  return (
    <div className="patient-dashboard-root">
      {/* Main Content Area */}
      <main className="patient-main-page">
        <div className="patient-dashboard-container">
          {/* Sidebar + Main Grid Layout - Identical to Patient Dashboard */}
          <div className="patient-portal-layout">
            {/* Sidebar Navigation */}
            <aside className={`patient-sidebar ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
              <nav className="sidebar-menu">
                {/* Doctor Profile Header Badge */}
                <div className="sidebar-user-card-header">
                  <div className="user-avatar-badge" style={{ overflow: 'hidden', padding: 0 }}>
                    {(!removeAvatarFlag && (avatarPreview || profile?.avatar || user?.profilePhoto || user?.avatar)) ? (
                      <img 
                        src={avatarPreview || getFullImageUrl(profile?.avatar || user?.profilePhoto || user?.avatar)} 
                        alt={user?.name || profile.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      getInitials(user?.name || profile.name || 'Satya Prakash')
                    )}
                  </div>
                  <div className="user-info-text">
                    <h3>Dr. {user?.name || profile.name || 'Satya Prakash'}</h3>
                    <p>{user?.email || 'doctor@satyaphyseo.com'}</p>
                    <span className="user-role-tag">PHYSIOTHERAPIST</span>
                  </div>
                </div>

                <div className="sidebar-section-title">SPECIALIST WORKSPACE</div>

                <button
                  className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <span className="sidebar-link-icon"><Calendar size={18} /></span>
                  <span className="sidebar-link-text">Overview & Today</span>
                  {todayAppointments.length > 0 && <span className="sidebar-badge">{todayAppointments.length}</span>}
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  <span className="sidebar-link-icon"><Clock size={18} /></span>
                  <span className="sidebar-link-text">Appointment Requests</span>
                  {pendingRequests.length > 0 && <span className="sidebar-badge badge-unread">{pendingRequests.length}</span>}
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  <span className="sidebar-link-icon"><User size={18} /></span>
                  <span className="sidebar-link-text">Patient History</span>
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <span className="sidebar-link-icon"><Bell size={18} /></span>
                  <span className="sidebar-link-text">Notifications</span>
                  {unreadNotifs > 0 && <span className="sidebar-badge badge-unread">{unreadNotifs}</span>}
                </button>

                <div className="sidebar-section-title" style={{ marginTop: '0.75rem' }}>CREDENTIALS & SETTINGS</div>

                <button
                  className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <span className="sidebar-link-icon"><Award size={18} /></span>
                  <span className="sidebar-link-text">Profile & Availability</span>
                </button>

                <Link
                  to="/"
                  className="sidebar-link"
                  style={{ marginTop: '0.25rem' }}
                >
                  <span className="sidebar-link-icon"><ArrowRight size={18} /></span>
                  <span className="sidebar-link-text">Main Website</span>
                </Link>

                <button
                  className="sidebar-link sidebar-logout-btn"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  <span className="sidebar-link-icon"><LogOut size={18} /></span>
                  <span className="sidebar-link-text">Sign Out</span>
                </button>
              </nav>

              <div className="sidebar-helpline-card">
                <div className="helpline-icon-wrap">
                  <Phone size={20} />
                </div>
                <div className="helpline-info">
                  <span className="helpline-label">Clinic Reception Desk</span>
                  <a href="tel:+917500831828" className="helpline-number">
                    +91 7500831828
                  </a>
                </div>
              </div>
            </aside>

            {/* Main Panel Content (RIGHT SIDE) */}
            <div className="patient-content-area">
              {/* Mobile Dashboard Topbar Toggle */}
              <div className="mobile-dashboard-header">
                <div className="mobile-tab-info">
                  <span className="mobile-tab-label">Physio Workspace</span>
                  <strong className="mobile-tab-name">
                    {activeTab === 'overview' && 'Overview & Today'}
                    {activeTab === 'requests' && 'Appointment Requests'}
                    {activeTab === 'history' && 'Patient History'}
                    {activeTab === 'notifications' && `Notifications ${unreadNotifs > 0 ? `(${unreadNotifs})` : ''}`}
                    {activeTab === 'profile' && 'Profile & Availability'}
                  </strong>
                </div>
                <button
                  type="button"
                  className="mobile-sidebar-toggle-btn"
                  onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                >
                  {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                  <span>{mobileSidebarOpen ? 'Close Menu' : 'Physio Menu'}</span>
                </button>
              </div>
              {/* Welcome Hero Bar */}
              <div className="patient-hero-bar">
                <div className="patient-welcome">
                  <h1>
                    Welcome Back, <span className="serif-italic-teal">Dr. {user?.name || profile.name || 'Satya Prakash'}</span>
                  </h1>
                  <p>{profile.qualification} · {profile.specialization} · {profile.experienceYears} Years Clinical Exp.</p>
                </div>
              </div>

              {statusMsg.text && (
                <div className={`auth-alert ${statusMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} />
                    <span>{statusMsg.text}</span>
                  </div>
                  <button 
                    onClick={() => setStatusMsg({ type: '', text: '' })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* TAB 1: OVERVIEW & TODAY'S APPOINTMENTS */}
              {activeTab === 'overview' && (
                <div>
                  {/* KPI Quick Cards */}
                  <div className="patient-kpi-grid">
                    <div className="kpi-card">
                      <div className="kpi-icon-wrap kpi-icon-teal">
                        <MapPin size={24} />
                      </div>
                      <div className="kpi-content">
                        <div className="kpi-label">Upcoming / Today's Visits</div>
                        <div className="kpi-value">{todayAppointments.length}</div>
                        <div className="kpi-sub">Clinic & Home visits</div>
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-icon-wrap kpi-icon-orange">
                        <Clock size={24} />
                      </div>
                      <div className="kpi-content">
                        <div className="kpi-label">Pending Confirmation</div>
                        <div className="kpi-value">{pendingRequests.length}</div>
                        <div className="kpi-sub">Awaiting doctor review</div>
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-icon-wrap kpi-icon-navy">
                        <CheckCircle2 size={24} />
                      </div>
                      <div className="kpi-content">
                        <div className="kpi-label">Completed Consultations</div>
                        <div className="kpi-value">{completedAppointments.length}</div>
                        <div className="kpi-sub">Total patient visits</div>
                      </div>
                    </div>
                  </div>

                  {/* Today's Schedule Panel */}
                  <div className="admin-panel" style={{ marginTop: '1.5rem' }}>
                    <div className="admin-panel-header">
                      <h2 className="admin-panel-title">Active / Today's Scheduled Visits</h2>
                      <button className="btn btn-outline-dark doc-btn-sm" onClick={() => setActiveTab('requests')}>
                        Manage All Requests
                      </button>
                    </div>

                    {todayAppointments.length > 0 ? (
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Patient Details</th>
                              <th>Service & Type</th>
                              <th>Date & Time Slot</th>
                              <th>Venue / Address</th>
                              <th>Payment Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {todayAppointments.map((apt) => (
                              <tr key={apt._id}>
                                <td>
                                  <strong>{apt.patientName}</strong>
                                  <div className="table-sub-text"><Phone size={12} /> {apt.phone}</div>
                                  {apt.email && <div className="table-sub-text">{apt.email}</div>}
                                </td>
                                <td>
                                  <div>
                                    {apt.appointmentType === 'home' ? (
                                      <span className="status-badge status-home" style={{ display: 'inline-block', marginBottom: '0.25rem' }}>
                                        <Home size={12} /> Home Physio
                                      </span>
                                    ) : (
                                      <span className="status-badge status-upcoming" style={{ display: 'inline-block', marginBottom: '0.25rem' }}>
                                        <MapPin size={12} /> Clinic Visit
                                      </span>
                                    )}
                                  </div>
                                  <strong>{apt.service}</strong>
                                </td>
                                <td>
                                  <div><strong>{apt.date}</strong></div>
                                  <div className="table-sub-text"><Clock size={12} /> {apt.timeSlot}</div>
                                </td>
                                <td>
                                  {apt.appointmentType === 'home' ? (
                                    <div>
                                      <strong>{apt.homeAddress}</strong>
                                      <div className="table-sub-text">{apt.cityArea}</div>
                                    </div>
                                  ) : (
                                    <div className="table-sub-text">Satya Clinic Desk</div>
                                  )}
                                </td>
                                <td>
                                  <button
                                    className={`status-badge ${apt.paymentStatus === 'paid' ? 'status-completed' : 'status-cancelled'}`}
                                    onClick={() => handleTogglePayment(apt._id, apt.paymentStatus)}
                                    title="Click to toggle payment status"
                                    style={{ cursor: 'pointer', border: 'none' }}
                                  >
                                    <DollarSign size={12} /> {apt.paymentStatus === 'paid' ? 'Paid (Offline/Online)' : 'Pending (Offline)'}
                                  </button>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    <button
                                      className="btn btn-teal doc-btn-sm"
                                      onClick={() => handleUpdateStatus(apt._id, 'completed')}
                                    >
                                      <Check size={14} /> Complete
                                    </button>

                                    <button
                                      className="btn btn-outline-dark doc-btn-sm"
                                      onClick={() => setRescheduleModal({ isOpen: true, aptId: apt._id, date: apt.date, timeSlot: apt.timeSlot })}
                                    >
                                      <Edit3 size={14} /> Reschedule
                                    </button>

                                    <button
                                      className="action-btn-danger-text"
                                      onClick={() => setCancelModal({ isOpen: true, aptId: apt._id, reason: '' })}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="empty-state-block">
                        <div className="empty-state-icon-wrap">
                          <Calendar size={32} />
                        </div>
                        <h3>No Active Appointments Today</h3>
                        <p>There are no clinic or home visits scheduled for today yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: APPOINTMENT REQUESTS & FULL MANAGEMENT */}
              {activeTab === 'requests' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">All Patient Appointment Requests</h2>
                      <p className="admin-subtitle">Confirm, reject, reschedule, mark completed, or toggle offline payment status.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending Your Approval</option>
                        <option value="CONFIRMED">Confirmed / Upcoming</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="REJECTED">Declined / Cancelled</option>
                      </select>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{ padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      >
                        <option value="ALL">All Consultation Types</option>
                        <option value="clinic">Clinic Visit</option>
                        <option value="home">Home Physio</option>
                      </select>
                      <div style={{ position: 'relative', width: '200px' }}>
                        <input
                          type="text"
                          placeholder="Search patient/phone..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ width: '100%', padding: '0.45rem 0.65rem 0.45rem 1.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                        <Search size={14} style={{ position: 'absolute', left: '0.55rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      </div>
                    </div>
                  </div>

                  {filteredAppointments.length > 0 ? (
                    <>
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Patient Basic Details</th>
                              <th>Service Requested</th>
                              <th>Date & Time</th>
                              <th>Venue / Location</th>
                              <th>Status & Payment</th>
                              <th>Specialist Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedRequests.map((apt) => (
                              <tr key={apt._id}>
                                <td>
                                  <strong>{apt.patientName}</strong>
                                  <div className="table-sub-text"><Phone size={12} /> {apt.phone}</div>
                                  {apt.email && <div className="table-sub-text">{apt.email}</div>}
                                  {apt.notes && <div className="table-sub-text" style={{ fontStyle: 'italic', marginTop: '0.2rem' }}>Note: {apt.notes}</div>}
                                </td>
                                <td>
                                  <div>
                                    {apt.appointmentType === 'home' ? (
                                      <span className="status-badge status-home" style={{ display: 'inline-block', marginBottom: '0.25rem' }}>
                                        <Home size={12} /> Home Physio
                                      </span>
                                    ) : (
                                      <span className="status-badge status-upcoming" style={{ display: 'inline-block', marginBottom: '0.25rem' }}>
                                        <MapPin size={12} /> Clinic Visit
                                      </span>
                                    )}
                                  </div>
                                  <strong>{apt.service}</strong>
                                </td>
                                <td>
                                  <div><strong>{apt.date}</strong></div>
                                  <div className="table-sub-text"><Clock size={12} /> {apt.timeSlot}</div>
                                </td>
                                <td>
                                  {apt.appointmentType === 'home' ? (
                                    <div>
                                      <strong>{apt.homeAddress}</strong>
                                      <div className="table-sub-text">{apt.cityArea}</div>
                                    </div>
                                  ) : (
                                    <div className="table-sub-text">Satya Physiotherapy Center</div>
                                  )}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {apt.status === 'PENDING_PHYSIOTHERAPIST_APPROVAL' && (
                                      <span className="status-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Pending Your Approval</span>
                                    )}
                                    {(apt.status === 'CONFIRMED' || apt.status === 'upcoming') && (
                                      <span className="status-badge status-upcoming">Confirmed</span>
                                    )}
                                    {apt.status === 'REJECTED_BY_PHYSIOTHERAPIST' && (
                                      <span className="status-badge status-cancelled">Declined by You</span>
                                    )}
                                    {apt.status === 'completed' && (
                                      <span className="status-badge status-completed">Completed</span>
                                    )}
                                    {apt.status === 'cancelled' && (
                                      <span className="status-badge status-cancelled">Cancelled</span>
                                    )}
                                    <button
                                      className={`status-badge ${apt.paymentStatus === 'paid' ? 'status-completed' : 'status-cancelled'}`}
                                      onClick={() => handleTogglePayment(apt._id, apt.paymentStatus)}
                                      title="Click to toggle Offline Payment status"
                                      style={{ cursor: 'pointer', border: 'none', textAlign: 'center' }}
                                    >
                                      <DollarSign size={12} /> {apt.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                    {apt.status === 'PENDING_PHYSIOTHERAPIST_APPROVAL' && (
                                      <>
                                        <button className="btn btn-teal doc-btn-sm" onClick={() => handleAcceptByDoctor(apt._id)}>
                                          <Check size={14} /> Accept Request
                                        </button>
                                        <button className="action-btn-danger-text" onClick={() => handleRejectByDoctor(apt._id)}>
                                          Reject
                                        </button>
                                      </>
                                    )}
                                    {(apt.status === 'CONFIRMED' || apt.status === 'upcoming') && (
                                      <>
                                        <button
                                          className="btn btn-teal doc-btn-sm"
                                          onClick={() => handleUpdateStatus(apt._id, 'completed')}
                                        >
                                          <Check size={14} /> Complete
                                        </button>
                                        <button
                                          className="btn btn-outline-dark doc-btn-sm"
                                          onClick={() => setRescheduleModal({ isOpen: true, aptId: apt._id, date: apt.date, timeSlot: apt.timeSlot })}
                                        >
                                          Reschedule
                                        </button>
                                        <button
                                          className="action-btn-danger-text"
                                          onClick={() => setCancelModal({ isOpen: true, aptId: apt._id, reason: '' })}
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    )}
                                    {apt.status === 'completed' && (
                                      <span className="table-sub-text" style={{ color: '#00b493', fontWeight: 'bold' }}>✓ Consultation Finished</span>
                                    )}
                                    {apt.status === 'REJECTED_BY_PHYSIOTHERAPIST' && (
                                      <span className="table-sub-text" style={{ color: '#ef4444' }}>Declined Request</span>
                                    )}
                                    {apt.status === 'cancelled' && (
                                      <span className="table-sub-text" style={{ color: '#ef4444' }}>Cancelled</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Pagination currentPage={pageReqs} totalPages={totalReqPages} onPageChange={setPageReqs} totalItems={filteredAppointments.length} itemsPerPage={10} />
                    </>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <Search size={32} />
                      </div>
                      <h3>No Appointments Found</h3>
                      <p>No appointment records match your search criteria.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PATIENT HISTORY (FILTERED REAL PATIENTS CONNECTED TO THIS PHYSIOTHERAPIST) */}
              {activeTab === 'history' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">Connected Patient History Records</h2>
                      <p className="admin-subtitle">Showing only patients who have consultation records with you.</p>
                    </div>
                  </div>

                  {patientHistory.length > 0 ? (
                    <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Patient Name & Contact</th>
                            <th>Total Sessions</th>
                            <th>Last Visit</th>
                            <th>Next Scheduled</th>
                            <th>Latest Status</th>
                            <th>Patient Log</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patientHistory.map((pat) => (
                            <tr key={pat.patientId}>
                              <td>
                                <strong>{pat.patientName}</strong>
                                <div className="table-sub-text"><Phone size={12} /> {pat.phone}</div>
                                {pat.email && <div className="table-sub-text">{pat.email}</div>}
                              </td>
                              <td>
                                <span className="status-badge" style={{ background: '#f1f5f9', color: '#334155', fontWeight: '600' }}>
                                  {pat.totalSessions} Session(s)
                                </span>
                              </td>
                              <td>{pat.lastVisitDate || 'N/A'}</td>
                              <td>{pat.nextVisitDate || 'None'}</td>
                              <td>
                                <span className={`status-badge ${pat.latestStatus === 'completed' ? 'status-completed' : 'status-upcoming'}`}>
                                  {pat.latestStatus}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-outline-dark doc-btn-sm"
                                  onClick={() => setSelectedPatientModal(pat)}
                                >
                                  <FileText size={14} /> View History Log
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <User size={32} />
                      </div>
                      <h3>No Connected Patient Records Found</h3>
                      <p>Patients will automatically appear here once they book or complete consultations with you.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PROFILE & CLINICAL CREDENTIALS */}
              {activeTab === 'profile' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">Profile & Clinical Credentials Management</h2>
                      <p className="admin-subtitle">Update your qualifications, experience, specializations, services, consultation fee, and available time slots.</p>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="booking-form-body">
                    {/* Doctor Profile Photo Upload Block */}
                    <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                      <label style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a', display: 'block', marginBottom: '0.75rem' }}>
                        Specialist Profile Photo
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                        <div style={{ width: '84px', height: '84px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #00b493', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {(!removeAvatarFlag && (avatarPreview || profile?.avatar || user?.profilePhoto || user?.avatar)) ? (
                            <img 
                              src={avatarPreview || getFullImageUrl(profile?.avatar || user?.profilePhoto || user?.avatar)} 
                              alt="Doctor Profile Preview" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          ) : (
                            <User size={38} color="#ffffff" />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <input 
                            type="file" 
                            id="physioAvatarFileInput"
                            accept="image/*" 
                            onChange={handleAvatarFileChange} 
                            style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }} 
                          />
                          <p className="table-sub-text" style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                            Upload an image file (JPG, PNG, WEBP). High-resolution portrait recommended.
                          </p>
                          {(!removeAvatarFlag && (avatarPreview || profile.avatar || user?.profilePhoto || user?.avatar)) && (
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              style={{
                                marginTop: '0.65rem',
                                background: '#fee2e2',
                                border: '1px solid #fca5a5',
                                color: '#dc2626',
                                padding: '0.4rem 0.85rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem'
                              }}
                            >
                              <X size={15} /> Remove Photo
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Doctor Full Name</label>
                        <input
                          type="text"
                          required
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Qualifications (Degree / Certification)</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. MPT (Orthopedics), BPT"
                          value={profile.qualification}
                          onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Clinical Experience (Years)</label>
                        <input
                          type="number"
                          required
                          value={profile.experienceYears}
                          onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Primary Specialization</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Spine & Joint Rehabilitation"
                          value={profile.specialization}
                          onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Consultation Fee</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ₹800"
                          value={profile.consultationFee}
                          onChange={(e) => setProfile({ ...profile, consultationFee: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Services Offered (Comma Separated)</label>
                        <input
                          type="text"
                          required
                          placeholder="Orthopedic Rehab, Sports Injury Care, Spine Therapy"
                          value={Array.isArray(profile.servicesOffered) ? profile.servicesOffered.join(', ') : profile.servicesOffered}
                          onChange={(e) => setProfile({ ...profile, servicesOffered: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Available Daily Time Slots (Comma Separated)</label>
                      <input
                        type="text"
                        required
                        placeholder="09:00 AM, 10:00 AM, 11:30 AM, 02:00 PM, 04:00 PM, 05:30 PM"
                        value={Array.isArray(profile.availableSlots) ? profile.availableSlots.join(', ') : profile.availableSlots}
                        onChange={(e) => setProfile({ ...profile, availableSlots: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Clinical Bio / Special Interests</label>
                      <textarea
                        rows={4}
                        required
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <button type="submit" className="btn btn-teal form-submit-btn" style={{ width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
                      Save Clinical Credentials & Time Slots
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="admin-panel">
                  <div className="admin-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="admin-panel-title">System Notifications</h2>
                      <p className="admin-subtitle">{unreadNotifs} unread message(s)</p>
                    </div>
                    {unreadNotifs > 0 && (
                      <button className="btn btn-outline-dark doc-btn-sm" onClick={handleMarkAllNotificationsRead}>
                        <CheckCircle2 size={14} /> Mark All as Read
                      </button>
                    )}
                  </div>

                  {notifications.length > 0 ? (
                    <>
                      <div className="notifications-list">
                        {paginatedNotifs.map((n) => (
                          <div
                            key={n._id}
                            className={`notif-card ${!n.read ? 'unread' : ''}`}
                            onClick={() => handleNotificationClick(n)}
                          >
                            <div className="notif-header">
                              <span className="notif-title"><Bell size={16} /> {n.title}</span>
                              <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="notif-msg">{n.message}</p>
                          </div>
                        ))}
                      </div>
                      <Pagination currentPage={pageNotifs} totalPages={totalNotifPages} onPageChange={setPageNotifs} totalItems={notifications.length} itemsPerPage={10} />
                    </>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <Bell size={32} />
                      </div>
                      <h3>No System Notifications</h3>
                      <p>You have no unread notifications.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Patient Detailed Session Log Modal */}
      {selectedPatientModal && (
        <div className="modal-backdrop" onClick={() => setSelectedPatientModal(null)}>
          <div className="booking-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px', padding: '1.75rem' }}>
            <div className="booking-modal-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3>Patient Consultation History</h3>
                <p className="table-sub-text">History record for <strong>{selectedPatientModal.patientName}</strong> ({selectedPatientModal.phone})</p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedPatientModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Service</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Notes / Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPatientModal.appointments && selectedPatientModal.appointments.map((apt) => (
                    <tr key={apt._id}>
                      <td>{apt.date}<br/><small>{apt.timeSlot}</small></td>
                      <td>{apt.service}</td>
                      <td>{apt.appointmentType === 'home' ? 'Home' : 'Clinic'}</td>
                      <td>
                        <span className={`status-badge ${apt.status === 'completed' ? 'status-completed' : 'status-upcoming'}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td>{apt.notes || apt.reason || 'None'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <button className="btn btn-outline-dark doc-btn-sm" onClick={() => setSelectedPatientModal(null)}>
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.isOpen && (
        <div className="modal-backdrop" onClick={() => setRescheduleModal({ isOpen: false, aptId: null, date: '', timeSlot: '10:00 AM' })}>
          <div className="booking-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '1.75rem' }}>
            <div className="booking-modal-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3>Reschedule Appointment</h3>
                <p className="table-sub-text">Choose new date & time slot for patient</p>
              </div>
              <button className="modal-close-btn" onClick={() => setRescheduleModal({ isOpen: false, aptId: null, date: '', timeSlot: '10:00 AM' })}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>New Appointment Date *</label>
                <input
                  type="date"
                  required
                  value={rescheduleModal.date}
                  onChange={(e) => setRescheduleModal({ ...rescheduleModal, date: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Select Time Slot *</label>
                <select
                  value={rescheduleModal.timeSlot}
                  onChange={(e) => setRescheduleModal({ ...rescheduleModal, timeSlot: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                >
                  {(Array.isArray(profile.availableSlots) ? profile.availableSlots : ["09:00 AM", "10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM", "05:30 PM"]).map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline-dark doc-btn-sm"
                  onClick={() => setRescheduleModal({ isOpen: false, aptId: null, date: '', timeSlot: '10:00 AM' })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-teal doc-btn-sm">
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel / Reject Modal */}
      {cancelModal.isOpen && (
        <div className="modal-backdrop" onClick={() => setCancelModal({ isOpen: false, aptId: null, reason: '' })}>
          <div className="booking-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '1.75rem' }}>
            <div className="booking-modal-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3>Reject / Cancel Appointment</h3>
                <p className="table-sub-text">Provide cancellation note for patient</p>
              </div>
              <button className="modal-close-btn" onClick={() => setCancelModal({ isOpen: false, aptId: null, reason: '' })}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Cancellation Reason / Note</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Doctor unavailable at selected slot, please reschedule."
                  value={cancelModal.reason}
                  onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline-dark doc-btn-sm"
                  onClick={() => setCancelModal({ isOpen: false, aptId: null, reason: '' })}
                >
                  Dismiss
                </button>
                <button type="submit" className="btn btn-logout-danger doc-btn-sm">
                  Confirm Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
