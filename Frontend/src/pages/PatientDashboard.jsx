import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Calendar, Clock, User, Phone, Mail, FileText, Bell, Lock, Home,
  Search, Plus, CheckCircle2, AlertCircle, X, Menu, ShieldCheck,
  Video, MapPin, LogOut, ArrowRight, Download, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import DoctorDirectory from '../components/doctors/DoctorDirectory';
import BookingModal from '../components/booking/BookingModal';
import Pagination from '../components/common/Pagination';
import '../styles/admin.css';

const PatientDashboard = () => {
  const { user, logout, updateProfile, changePassword, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.role === 'physio') {
      if (user.registrationStatus === 'INCOMPLETE') {
        navigate('/physio/register', { replace: true });
        return;
      }
      if (user.approvalStatus === 'PENDING') {
        navigate('/physio/pending-approval', { replace: true });
        return;
      }
      if (user.approvalStatus === 'REJECTED') {
        navigate('/physio/rejected', { replace: true });
        return;
      }
      if (user.approvalStatus === 'APPROVED' && user.isApproved) {
        navigate('/doctor-dashboard', { replace: true });
        return;
      }
      navigate('/physio/pending-approval', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const getTabFromUrl = () => {
    let rawTab = searchParams.get('tab');
    if (!rawTab) {
      const pathParts = location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 1 && pathParts[0] === 'patient-dashboard') {
        rawTab = pathParts[1];
      }
    }
    if (!rawTab) return 'overview';
    if (rawTab === 'consultations' || rawTab === 'online-consultations') return 'online';
    return rawTab;
  };

  const [activeTab, setActiveTabState] = useState(getTabFromUrl);

  const markNotificationsAsReadIfNeeded = (tabName, currentNotifsList = null) => {
    if (tabName === 'notifications') return;

    setNotifications((prev) => {
      const list = currentNotifsList || prev;
      if (!list || list.length === 0) return prev;

      let targetType = null;
      let isMatchingNotification = () => false;

      if (tabName === 'appointments') {
        targetType = 'appointment';
        isMatchingNotification = (n) => n.type === 'appointment' || (n.title && n.title.toLowerCase().includes('appointment'));
      } else if (tabName === 'online') {
        targetType = 'consultation';
        isMatchingNotification = (n) => n.type === 'consultation' || (n.title && n.title.toLowerCase().includes('consultation'));
      } else if (tabName === 'reports') {
        targetType = 'system';
        isMatchingNotification = (n) => n.type === 'system' || (n.title && (n.title.toLowerCase().includes('report') || n.title.toLowerCase().includes('document')));
      } else {
        // Overview or general tab switch: mark all unread as read in DB
        isMatchingNotification = () => true;
      }

      const matchingUnread = list.filter((n) => !n.read && isMatchingNotification(n));
      if (matchingUnread.length > 0) {
        if (targetType) {
          api.markNotificationsTypeRead({ type: targetType }).catch((err) => {
            console.error(`Failed to mark ${targetType} notifications as read in DB:`, err);
          });
        } else {
          api.markAllNotificationsRead().catch((err) => {
            console.error("Failed to mark all notifications as read in DB:", err);
          });
        }

        return prev.map((n) => {
          if (!n.read && isMatchingNotification(n)) {
            return { ...n, read: true };
          }
          return n;
        });
      }

      return prev;
    });
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const setActiveTab = (newTab, replace = false) => {
    setActiveTabState(newTab);
    setSearchParams({ tab: newTab }, { replace });
    setMobileSidebarOpen(false);
    markNotificationsAsReadIfNeeded(newTab);
  };

  useEffect(() => {
    const urlTab = getTabFromUrl();
    if (urlTab !== activeTab) {
      setActiveTabState(urlTab);
      markNotificationsAsReadIfNeeded(urlTab);
    }
  }, [location.pathname, location.search]);

  const [appointments, setAppointments] = useState([]);
  const [onlineConsultations, setOnlineConsultations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingType, setSelectedBookingType] = useState('in-person');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalType, setBookingModalType] = useState('in-person');
  const [preselectedDoctor, setPreselectedDoctor] = useState(null);
  const [selectedReportFile, setSelectedReportFile] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [uploadingReport, setUploadingReport] = useState(false);
  const [reportMsg, setReportMsg] = useState({ type: '', text: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [pageApts, setPageApts] = useState(1);
  const [pageOnline, setPageOnline] = useState(1);
  const [pageNotifs, setPageNotifs] = useState(1);
  const [pageReports, setPageReports] = useState(1);

  const totalAptPages = Math.ceil(appointments.length / 10);
  const paginatedAppointments = appointments.slice((pageApts - 1) * 10, pageApts * 10);

  const totalOnlinePages = Math.ceil(onlineConsultations.length / 10);
  const paginatedOnline = onlineConsultations.slice((pageOnline - 1) * 10, pageOnline * 10);

  const totalNotifPages = Math.ceil(notifications.length / 10);
  const paginatedNotifs = notifications.slice((pageNotifs - 1) * 10, pageNotifs * 10);

  const totalReportPages = Math.ceil(reports.length / 10);
  const paginatedReports = reports.slice((pageReports - 1) * 10, pageReports * 10);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.autoOpenBooking) {
      handleOpenBooking(location.state.bookingType || 'in-person', location.state.preselectedDoctor);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [aptsRes, onlRes, notifRes, repRes] = await Promise.all([
        api.getMyAppointments().catch(() => ({ data: [] })),
        api.getMyOnlineConsultations().catch(() => ({ data: [] })),
        api.getNotifications().catch(() => ({ data: [], unreadCount: 0 })),
        api.getMyReports().catch(() => ({ data: [] }))
      ]);

      const rawNotifs = notifRes.data || [];
      const currentTab = getTabFromUrl();

      setAppointments(aptsRes.data || []);
      setOnlineConsultations(onlRes.data || []);
      setReports(repRes.data || []);
      setNotifications(rawNotifs);

      if (currentTab !== 'notifications') {
        setTimeout(() => {
          markNotificationsAsReadIfNeeded(currentTab, rawNotifs);
        }, 10);
      }
    } catch (err) {
      console.error("Failed to load patient dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReportFile) {
      setReportMsg({ type: 'error', text: 'Please select a medical report file (PDF, JPG, JPEG, or PNG).' });
      return;
    }
    setUploadingReport(true);
    setReportMsg({ type: '', text: '' });
    try {
      const formData = new FormData();
      formData.append('reportFile', selectedReportFile);
      if (selectedAppointmentId) {
        formData.append('appointmentId', selectedAppointmentId);
      }

      await api.uploadReport(formData);
      setReportMsg({ type: 'success', text: 'Medical report uploaded successfully to Cloudinary!' });
      setSelectedReportFile(null);
      setSelectedAppointmentId('');
      const fileInput = document.getElementById('medical-report-file-input');
      if (fileInput) fileInput.value = '';
      loadDashboardData();
    } catch (err) {
      setReportMsg({ type: 'error', text: err.message || 'Failed to upload medical report' });
    } finally {
      setUploadingReport(false);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical report?')) return;
    try {
      await api.deleteReport(id);
      setReportMsg({ type: 'success', text: 'Medical report deleted successfully.' });
      loadDashboardData();
    } catch (err) {
      setReportMsg({ type: 'error', text: err.message || 'Failed to delete report' });
    }
  };

  const handleOpenBooking = (type = 'in-person', doctor = null) => {
    setBookingModalType(type);
    setPreselectedDoctor(doctor);
    setIsBookingModalOpen(true);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    try {
      await updateProfile(profileForm);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    try {
      await changePassword(passwordForm);
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password' });
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.cancelAppointment(id);
      loadDashboardData();
    } catch (err) {
      alert(err.message || "Failed to cancel appointment");
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
      console.error("Notification mark read failed:", err);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: false } : n))
      );
    }
  };

  const getInitials = (name) => {
    if (!name) return 'MR';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isUpcomingAppointment = (apt) => {
    if (!apt) return false;
    const activeStatuses = ['PENDING_ADMIN_APPROVAL', 'PENDING_PHYSIOTHERAPIST_APPROVAL', 'CONFIRMED', 'upcoming'];
    if (!activeStatuses.includes(apt.status)) return false;

    if (apt.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const aptDate = new Date(apt.date);
      if (!isNaN(aptDate.getTime())) {
        aptDate.setHours(23, 59, 59, 999);
        if (aptDate < today) return false;
      }
    }
    return true;
  };

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <div className="patient-dashboard-root">
      {/* Main Content Area */}
      <main className="patient-main-page">
        <div className="patient-dashboard-container">
          {/* Sidebar + Main Grid */}
          <div className="patient-portal-layout">
            {/* Sidebar Navigation */}
            <aside className={`patient-sidebar ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
              <nav className="sidebar-menu">
                {/* User Profile Summary Header (Unified in single block) */}
                <div className="sidebar-user-card-header">
                  <div className="user-avatar-badge">
                    {getInitials(user?.name || 'Mahima Rathi')}
                  </div>
                  <div className="user-info-text">
                    <h3>{user?.name || 'Mahima Rathi'}</h3>
                    <p>{user?.email || 'patient@example.com'}</p>
                    <span className="user-role-tag">PATIENT PORTAL</span>
                  </div>
                </div>

                <div className="sidebar-section-title">PORTAL MENU</div>

                <button
                  className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <span className="sidebar-link-icon"><Calendar size={18} /></span>
                  <span className="sidebar-link-text">Overview</span>
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'appointments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <span className="sidebar-link-icon"><MapPin size={18} /></span>
                  <span className="sidebar-link-text">My Appointments</span>
                  {appointments.length > 0 && <span className="sidebar-badge">{appointments.length}</span>}
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'online' ? 'active' : ''}`}
                  onClick={() => setActiveTab('online')}
                >
                  <span className="sidebar-link-icon"><Video size={18} /></span>
                  <span className="sidebar-link-text">Online Consultations</span>
                  {onlineConsultations.length > 0 && <span className="sidebar-badge">{onlineConsultations.length}</span>}
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'reports' ? 'active' : ''}`}
                  onClick={() => setActiveTab('reports')}
                >
                  <span className="sidebar-link-icon"><FileText size={18} /></span>
                  <span className="sidebar-link-text">Medical Reports</span>
                  {reports.length > 0 && <span className="sidebar-badge">{reports.length}</span>}
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'doctors' ? 'active' : ''}`}
                  onClick={() => setActiveTab('doctors')}
                >
                  <span className="sidebar-link-icon"><User size={18} /></span>
                  <span className="sidebar-link-text">Find Specialists</span>
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <span className="sidebar-link-icon"><Bell size={18} /></span>
                  <span className="sidebar-link-text">Notifications</span>
                  {unreadNotifs > 0 && <span className="sidebar-badge badge-unread">{unreadNotifs}</span>}
                </button>

                <div className="sidebar-section-title" style={{ marginTop: '0.75rem' }}>BOOK APPOINTMENT</div>

                <button
                  className="sidebar-link sidebar-action-btn"
                  onClick={() => handleOpenBooking('in-person')}
                >
                  <span className="sidebar-link-icon"><MapPin size={18} /></span>
                  <span className="sidebar-link-text">Book Clinic Visit</span>
                </button>

                <button
                  className="sidebar-link sidebar-action-btn"
                  onClick={() => handleOpenBooking('home')}
                >
                  <span className="sidebar-link-icon"><Home size={18} /></span>
                  <span className="sidebar-link-text">Book Home Visit</span>
                </button>

                <button
                  className="sidebar-link sidebar-action-btn"
                  onClick={() => handleOpenBooking('online')}
                >
                  <span className="sidebar-link-icon"><Video size={18} /></span>
                  <span className="sidebar-link-text">Request Online Consult</span>
                </button>

                <div className="sidebar-section-title" style={{ marginTop: '0.75rem' }}>ACCOUNT & SECURITY</div>

                <button
                  className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <span className="sidebar-link-icon"><User size={18} /></span>
                  <span className="sidebar-link-text">Edit Profile</span>
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  <span className="sidebar-link-icon"><Lock size={18} /></span>
                  <span className="sidebar-link-text">Change Password</span>
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
                  <span className="helpline-label">Need Urgent Assistance?</span>
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
                  <span className="mobile-tab-label">Current View</span>
                  <strong className="mobile-tab-name">
                    {activeTab === 'overview' && 'Overview'}
                    {activeTab === 'appointments' && 'My Appointments'}
                    {activeTab === 'online' && 'Online Consultations'}
                    {activeTab === 'reports' && 'Medical Reports'}
                    {activeTab === 'doctors' && 'Find Specialists'}
                    {activeTab === 'notifications' && `Notifications ${unreadNotifs > 0 ? `(${unreadNotifs})` : ''}`}
                    {activeTab === 'profile' && 'Edit Profile'}
                    {activeTab === 'password' && 'Change Password'}
                  </strong>
                </div>
                <button
                  type="button"
                  className="mobile-sidebar-toggle-btn"
                  onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                >
                  {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                  <span>{mobileSidebarOpen ? 'Close Menu' : 'Portal Menu'}</span>
                </button>
              </div>

              {/* Welcome Hero Bar (Positioned on the RIGHT side) */}
              <div className="patient-hero-bar">
                <div className="patient-welcome">
                  <h1>
                    Welcome Back, <span className="serif-italic-teal">{user?.name || 'Mahima Rathi'}</span>
                  </h1>
                  <p>Manage your clinic visits, home physiotherapy visits, online consultation requests, and specialist bookings.</p>
                </div>
              </div>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div>
                  {/* KPI Quick Cards */}
                  <div className="patient-kpi-grid">
                    <div className="kpi-card">
                      <div className="kpi-icon-wrap kpi-icon-teal">
                        <MapPin size={24} />
                      </div>
                      <div className="kpi-content">
                        <div className="kpi-label">Clinic Appointments</div>
                        <div className="kpi-value">{appointments.length}</div>
                        <div className="kpi-sub">
                          {appointments.filter(isUpcomingAppointment).length} Upcoming Visits
                        </div>
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-icon-wrap kpi-icon-navy">
                        <Video size={24} />
                      </div>
                      <div className="kpi-content">
                        <div className="kpi-label">Online Consultations</div>
                        <div className="kpi-value">{onlineConsultations.length}</div>
                        <div className="kpi-sub">Report reviews pending</div>
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-icon-wrap kpi-icon-orange">
                        <Bell size={24} />
                      </div>
                      <div className="kpi-content">
                        <div className="kpi-label">Unread Updates</div>
                        <div className="kpi-value">{unreadNotifs}</div>
                        <div className="kpi-sub">System notifications</div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Visit Highlights */}
                  <div className="admin-panel" style={{ marginTop: '1.5rem' }}>
                    <div className="admin-panel-header">
                      <h2 className="admin-panel-title">Upcoming Appointments</h2>
                      <button className="btn btn-outline-dark doc-btn-sm" onClick={() => setActiveTab('appointments')}>
                        View All
                      </button>
                    </div>

                    {appointments.filter(isUpcomingAppointment).length > 0 ? (
                      <div className="appointments-list-cards">
                        {appointments
                          .filter(isUpcomingAppointment)
                          .slice(0, 3)
                          .map((apt) => (
                            <div key={apt._id} className="apt-item-card">
                              <div className="apt-item-main">
                                <div className="apt-date-badge">
                                  <Calendar size={18} />
                                  <span>{apt.date}</span>
                                </div>
                                <div className="apt-details">
                                  <h3>{apt.service}</h3>
                                  <p className="apt-doc">Specialist: <strong>{apt.specialist}</strong></p>
                                  <p className="apt-time"><Clock size={14} /> Time Slot: {apt.timeSlot}</p>
                                  {apt.appointmentType === 'home' ? (
                                    <p className="table-sub-text" style={{ color: '#d97706', marginTop: '0.2rem' }}>
                                      📍 Home Visit Address: {apt.homeAddress}, {apt.cityArea}
                                    </p>
                                  ) : (
                                    <p className="table-sub-text" style={{ color: '#64748b', marginTop: '0.2rem' }}>
                                      📍 Venue: Satya Physiotherapy Center
                                    </p>
                                  )}
                                  <div style={{ marginTop: '0.4rem' }}>
                                    {apt.status === 'PENDING_ADMIN_APPROVAL' && (
                                      <span className="status-badge" style={{ background: '#fef3c7', color: '#b45309' }}>Waiting for Admin Approval</span>
                                    )}
                                    {apt.status === 'PENDING_PHYSIOTHERAPIST_APPROVAL' && (
                                      <span className="status-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Approved by Admin – Waiting for Physiotherapist</span>
                                    )}
                                    {(apt.status === 'CONFIRMED' || apt.status === 'upcoming') && (
                                      <span className="status-badge status-upcoming">Appointment Confirmed</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="apt-item-right">
                                {apt.appointmentType === 'home' ? (
                                  <span className="status-badge status-home">Home Physiotherapy</span>
                                ) : (
                                  <span className="status-badge status-upcoming">Clinic Visit</span>
                                )}
                                <button className="action-btn-danger-text" onClick={() => handleCancelAppointment(apt._id)}>
                                  Cancel Booking
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="empty-state-block">
                        <div className="empty-state-icon-wrap">
                          <Calendar size={28} />
                        </div>
                        <h3>No Upcoming Visits</h3>
                        <p>You have no upcoming clinic or home physiotherapy visits scheduled right now.</p>
                        <div className="empty-state-actions">
                          <button className="btn btn-teal doc-btn-sm" onClick={() => handleOpenBooking('in-person')}>
                            <MapPin size={16} /> Book Clinic Visit
                          </button>
                          <button className="btn btn-outline-dark doc-btn-sm" onClick={() => handleOpenBooking('home')}>
                            <Home size={16} /> Book Home Visit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MY APPOINTMENTS */}
              {activeTab === 'appointments' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h2 className="admin-panel-title">My Scheduled Appointments</h2>
                  </div>

                  {appointments.length > 0 ? (
                    <>
                    <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Type & Service</th>
                            <th>Specialist</th>
                            <th>Date & Time</th>
                            <th>Venue / Address</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedAppointments.map((apt) => (
                            <tr key={apt._id}>
                              <td>
                                <div>
                                  {apt.appointmentType === 'home' ? (
                                    <span className="status-badge status-home" style={{ display: 'inline-block', marginBottom: '0.25rem' }}>
                                      Home Physiotherapy
                                    </span>
                                  ) : (
                                    <span className="status-badge status-upcoming" style={{ display: 'inline-block', marginBottom: '0.25rem' }}>
                                      Clinic Visit
                                    </span>
                                  )}
                                </div>
                                <strong>{apt.service}</strong>
                                {apt.notes && <div className="table-sub-text">{apt.notes}</div>}
                              </td>
                              <td>{apt.specialist}</td>
                              <td>
                                <div><strong>{apt.date}</strong></div>
                                <div className="table-sub-text">{apt.timeSlot}</div>
                              </td>
                              <td>
                                {apt.appointmentType === 'home' ? (
                                  <div>
                                    <div><strong>{apt.homeAddress}</strong></div>
                                    <div className="table-sub-text">{apt.cityArea}</div>
                                  </div>
                                ) : (
                                  <div className="table-sub-text">Satya Physiotherapy Center</div>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
                                  {apt.status === 'PENDING_ADMIN_APPROVAL' && (
                                    <span className="status-badge" style={{ background: '#fef3c7', color: '#b45309' }}>Waiting for Admin Approval</span>
                                  )}
                                  {apt.status === 'PENDING_PHYSIOTHERAPIST_APPROVAL' && (
                                    <span className="status-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Approved by Admin – Waiting for Physiotherapist</span>
                                  )}
                                  {(apt.status === 'CONFIRMED' || apt.status === 'upcoming') && (
                                    <span className="status-badge status-upcoming">Appointment Confirmed</span>
                                  )}
                                  {apt.status === 'REJECTED_BY_ADMIN' && (
                                    <span className="status-badge status-cancelled">Rejected by Admin</span>
                                  )}
                                  {apt.status === 'REJECTED_BY_PHYSIOTHERAPIST' && (
                                    <span className="status-badge status-cancelled">Rejected by Physiotherapist</span>
                                  )}
                                  {apt.status === 'completed' && (
                                    <span className="status-badge status-completed">Completed</span>
                                  )}
                                  {apt.status === 'cancelled' && (
                                    <span className="status-badge status-cancelled">Cancelled</span>
                                  )}

                                  {(apt.status === 'PENDING_ADMIN_APPROVAL' || apt.status === 'PENDING_PHYSIOTHERAPIST_APPROVAL' || apt.status === 'CONFIRMED' || apt.status === 'upcoming') && (
                                    <button className="action-btn-danger-text" onClick={() => handleCancelAppointment(apt._id)} style={{ fontSize: '0.75rem', padding: '0.15rem 0' }}>
                                      Cancel Booking
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination currentPage={pageApts} totalPages={totalAptPages} onPageChange={setPageApts} totalItems={appointments.length} itemsPerPage={10} />
                    </>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <Calendar size={32} />
                      </div>
                      <h3>No Scheduled Appointments</h3>
                      <p>You haven't scheduled any clinic or home physiotherapy appointments yet. Choose an option below to schedule your visit with our specialists.</p>
                      <div className="empty-state-actions">
                        <button className="btn btn-teal doc-btn-sm" onClick={() => handleOpenBooking('in-person')}>
                          <MapPin size={16} /> Book Clinic Visit
                        </button>
                        <button className="btn btn-outline-dark doc-btn-sm" onClick={() => handleOpenBooking('home')}>
                          <Home size={16} /> Book Home Visit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ONLINE CONSULTATIONS */}
              {activeTab === 'online' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h2 className="admin-panel-title">Online Consultation Requests & Reports</h2>
                    <button className="btn btn-teal doc-btn-sm" onClick={() => handleOpenBooking('online')}>
                      <Plus size={16} /> New Request
                    </button>
                  </div>

                  {onlineConsultations.length > 0 ? (
                    <>
                    <div className="online-requests-grid">
                      {paginatedOnline.map((req) => (
                        <div key={req._id} className="online-req-card">
                          <div className="req-header">
                            <span className="status-badge status-upcoming">{req.status}</span>
                            <span className="req-date"><Calendar size={14} /> {req.preferredDate} ({req.preferredTime})</span>
                          </div>

                          <div className="req-body">
                            <h3>Condition / Reported Symptoms</h3>
                            <p>{req.condition}</p>
                            {req.additionalInfo && (
                              <p className="req-notes"><strong>Notes:</strong> {req.additionalInfo}</p>
                            )}
                          </div>

                          {req.reportFile && (
                            <div className="req-attachment">
                              <Eye size={16} className="info-icon-teal" />
                              <a
                                href={req.reportFile.startsWith('http') ? req.reportFile : `http://localhost:5000${req.reportFile}`}
                                className="report-link"
                              >
                                View Uploaded Medical Report
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <Pagination currentPage={pageOnline} totalPages={totalOnlinePages} onPageChange={setPageOnline} totalItems={onlineConsultations.length} itemsPerPage={10} />
                    </>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <Video size={32} />
                      </div>
                      <h3>No Online Consultations Submitted</h3>
                      <p>You haven't submitted any online consultation or report review requests yet. Submit your medical reports for specialist review.</p>
                      <div className="empty-state-actions">
                        <button className="btn btn-teal doc-btn-sm" onClick={() => handleOpenBooking('online')}>
                          <Plus size={16} /> Request Online Consult
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MEDICAL REPORTS */}
              {activeTab === 'reports' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h2 className="admin-panel-title">Patient Medical Reports & Scans</h2>
                  </div>

                  {reportMsg.text && (
                    <div className={`auth-alert ${reportMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.25rem' }}>
                      <AlertCircle size={18} />
                      <span>{reportMsg.text}</span>
                    </div>
                  )}

                  {/* Upload Form Card */}
                  <div className="apt-item-card" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '1.5rem', marginBottom: '1.5rem', display: 'block' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                      Upload Diagnostic Report / Scan to Cloudinary
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
                      Upload X-Ray, MRI, CT Scan, or Blood Work reports (PDF, JPG, JPEG, PNG up to 10MB).
                    </p>

                    <form onSubmit={handleReportUploadSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>Select File (PDF, Image) *</label>
                        <input
                          id="medical-report-file-input"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                          required
                          onChange={(e) => setSelectedReportFile(e.target.files[0])}
                          style={{ padding: '0.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%' }}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>Link to Scheduled Appointment (Optional)</label>
                        <select
                          value={selectedAppointmentId}
                          onChange={(e) => setSelectedAppointmentId(e.target.value)}
                          style={{ padding: '0.65rem', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%' }}
                        >
                          <option value="">General Medical History</option>
                          {appointments.map((apt) => (
                            <option key={apt._id} value={apt._id}>
                              {apt.service} - {apt.specialist} ({apt.date})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <button type="submit" className="btn btn-teal" disabled={uploadingReport} style={{ width: '100%', height: '42px' }}>
                          {uploadingReport ? (
                            <>
                              <RefreshCw size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} /> Uploading...
                            </>
                          ) : (
                            <>
                              <Plus size={16} /> Upload Report
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Uploaded Reports List */}
                  {reports.length > 0 ? (
                    <div className="appointments-list-cards">
                      {paginatedReports.map((rep) => (
                        <div key={rep._id} className="apt-item-card">
                          <div className="apt-item-main">
                            <div className="apt-date-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                              <FileText size={20} />
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                                {rep.fileType?.includes('pdf') ? 'PDF' : 'IMAGE'}
                              </span>
                            </div>
                            <div className="apt-details">
                              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{rep.fileName}</h3>
                              <p className="apt-doc">
                                Uploaded: <strong>{new Date(rep.uploadedAt || rep.createdAt).toLocaleDateString()}</strong>
                              </p>
                              {rep.appointmentId && (
                                <p className="apt-time" style={{ color: '#0284c7' }}>
                                  Linked Visit: {rep.appointmentId.service} with {rep.appointmentId.specialist} ({rep.appointmentId.date})
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="apt-item-right" style={{ flexDirection: 'row', gap: '0.75rem', alignItems: 'center' }}>
                            <a
                              href={rep.fileUrl ? (rep.fileUrl.startsWith('http') ? rep.fileUrl : `http://localhost:5000${rep.fileUrl}`) : '#'}
                              className="btn btn-outline-dark doc-btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <Eye size={16} /> View Report
                            </a>
                            <button className="action-btn-danger-text" onClick={() => handleDeleteReport(rep._id)}>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <FileText size={32} />
                      </div>
                      <h3>No Medical Reports Uploaded</h3>
                      <p>You haven't uploaded any X-Ray, MRI, or lab diagnostic reports yet. Upload reports above to share with your physical therapists.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: FIND & BOOK SPECIALISTS */}
              {activeTab === 'doctors' && (
                <div>
                  <div className="admin-panel-header" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="admin-panel-title">Browse Clinic Specialists & Book Direct</h2>
                  </div>
                  <DoctorDirectory onSelectBooking={handleOpenBooking} />
                </div>
              )}

              {/* TAB 5: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h2 className="admin-panel-title">System Notifications</h2>
                  </div>

                  {notifications.length > 0 ? (
                    <>
                    <div className="notifs-list">
                      {paginatedNotifs.map((n) => (
                        <div
                          key={n._id}
                          className={`notif-card ${!n.read ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="notif-top">
                            <div className="notif-title">
                              <Bell size={16} className="info-icon-teal" />
                              <strong>{n.title}</strong>
                            </div>
                            <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="notif-msg">{n.message}</p>
                        </div>
                      ))}
                    </div>
                    <Pagination currentPage={pageNotifs} totalPages={totalNotifPages} onPageChange={setPageNotifs} totalItems={notifications.length} itemsPerPage={10} />
                    </>
                  ) : (
                    <div className="panel-empty-state">
                      <p>No notifications available.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: EDIT PROFILE */}
              {activeTab === 'profile' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h2 className="admin-panel-title">Patient Profile Information</h2>
                  </div>

                  {profileMsg.text && (
                    <div className={`auth-alert ${profileMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit} className="booking-form-body">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input
                        type="tel"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Residential / Home Address</label>
                      <textarea
                        rows={3}
                        placeholder="Enter your complete street/home address"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--border-light, #cbd5e1)', fontSize: '0.95rem', resize: 'vertical' }}
                      />
                    </div>

                    <button type="submit" className="btn btn-teal">
                      Save Profile Changes
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 7: CHANGE PASSWORD */}
              {activeTab === 'password' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h2 className="admin-panel-title">Change Account Password</h2>
                  </div>

                  {passwordMsg.text && (
                    <div className={`auth-alert ${passwordMsg.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="booking-form-body">
                    <div className="form-group">
                      <label>Current Password</label>
                      <div className="input-icon-wrap">
                        <Lock size={18} className="input-icon" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          style={{ paddingRight: '2.6rem' }}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          title={showCurrentPassword ? "Hide password" : "Show password"}
                          aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        >
                          {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>New Password</label>
                      <div className="input-icon-wrap">
                        <Lock size={18} className="input-icon" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength="6"
                          placeholder="••••••••"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          style={{ paddingRight: '2.6rem' }}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          title={showNewPassword ? "Hide password" : "Show password"}
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-outline-dark">
                      Update Password
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Shared Dual-Option Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          loadDashboardData();
        }}
        initialType={bookingModalType}
        preselectedDoctor={preselectedDoctor}
      />
    </div>
  );
};

export default PatientDashboard;
