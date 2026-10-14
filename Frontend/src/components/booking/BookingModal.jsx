import React, { useState, useEffect } from 'react';
import { X, MapPin, Video, Home, Calendar, Clock, User, Phone, Mail, FileText, Upload, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const BookingModal = ({ isOpen, onClose, initialType = 'in-person', preselectedDoctor = null }) => {
  const { user } = useAuth();
  const [bookingType, setBookingType] = useState(initialType); // 'in-person', 'online', 'home'
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  // In-Person Form State
  const [inPersonData, setInPersonData] = useState({
    patientName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    service: 'Orthopedic Rehabilitation',
    specialist: preselectedDoctor ? preselectedDoctor.name : 'Dr. Satya Prakash',
    date: '',
    timeSlot: '10:00 AM',
    notes: ''
  });

  // Home Physiotherapy Form State
  const [homeData, setHomeData] = useState({
    patientName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    service: 'Orthopedic Rehabilitation',
    specialist: preselectedDoctor ? preselectedDoctor.name : 'Dr. Satya Prakash',
    date: '',
    timeSlot: '10:00 AM',
    homeAddress: '',
    cityArea: '',
    notes: ''
  });

  // Online Consultation Form State
  const [onlineData, setOnlineData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    condition: '',
    preferredDate: '',
    preferredTime: '10:00 AM',
    additionalInfo: '',
    physiotherapistId: preselectedDoctor ? preselectedDoctor._id : ''
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setBookingType(initialType);
      if (preselectedDoctor) {
        setInPersonData((prev) => ({ ...prev, specialist: preselectedDoctor.name }));
        setHomeData((prev) => ({ ...prev, specialist: preselectedDoctor.name }));
        setOnlineData((prev) => ({ ...prev, physiotherapistId: preselectedDoctor._id }));
      }
      loadInitialData();
    }
  }, [isOpen, initialType, preselectedDoctor]);

  useEffect(() => {
    if (user) {
      setInPersonData((prev) => ({ ...prev, patientName: user.name, phone: user.phone, email: user.email }));
      setHomeData((prev) => ({ ...prev, patientName: user.name, phone: user.phone, email: user.email, homeAddress: prev.homeAddress || user.address || '' }));
      setOnlineData((prev) => ({ ...prev, name: user.name, phone: user.phone, email: user.email }));
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      const [docsRes, servsRes] = await Promise.all([api.getDoctors(), api.getServices()]);
      setDoctors(docsRes.data || []);
      setServices(servsRes.data || []);
    } catch (err) {
      console.error("Failed to load doctors or services:", err);
    }
  };

  if (!isOpen) return null;

  const handleInPersonSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!inPersonData.patientName || !inPersonData.phone || !inPersonData.date) {
        throw new Error('Please fill in required fields: Patient Name, Phone, and Date');
      }

      const res = await api.createAppointment({
        ...inPersonData,
        appointmentType: 'clinic'
      });
      setConfirmation({
        type: 'in-person',
        id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
        data: res.data
      });
    } catch (err) {
      setError(err.message || 'Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleHomeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!homeData.patientName || !homeData.phone || !homeData.date || !homeData.homeAddress || !homeData.cityArea) {
        throw new Error('Please fill in required fields: Patient Name, Phone, Date, Home Address, and City / Area');
      }

      const res = await api.createAppointment({
        ...homeData,
        appointmentType: 'home'
      });

      setConfirmation({
        type: 'home',
        id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
        data: res.data
      });
    } catch (err) {
      setError(err.message || 'Failed to schedule home physiotherapy visit');
    } finally {
      setLoading(false);
    }
  };

  const handleOnlineSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!onlineData.name || !onlineData.phone || !onlineData.condition || !onlineData.preferredDate) {
        throw new Error('Please fill in required fields: Name, Phone, Condition, and Preferred Date');
      }

      const formData = new FormData();
      formData.append('name', onlineData.name);
      formData.append('phone', onlineData.phone);
      formData.append('email', onlineData.email);
      formData.append('condition', onlineData.condition);
      formData.append('preferredDate', onlineData.preferredDate);
      formData.append('preferredTime', onlineData.preferredTime);
      formData.append('additionalInfo', onlineData.additionalInfo);
      if (onlineData.physiotherapistId) {
        formData.append('physiotherapistId', onlineData.physiotherapistId);
      }
      if (selectedFile) {
        formData.append('reportFile', selectedFile);
      }

      const res = await api.createOnlineConsultation(formData);
      setConfirmation({
        type: 'online',
        id: `ONL-${Math.floor(1000 + Math.random() * 9000)}`,
        data: res.data
      });
    } catch (err) {
      setError(err.message || 'Failed to submit online consultation request');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setConfirmation(null);
    setError('');
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fullscreen-booking-modal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: '#080e1e',
        color: '#ffffff',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          padding: '1.25rem 2rem',
          backgroundColor: '#0d152a',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={resetAndClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            <X size={18} /> Close & Return
          </button>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00b493', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block' }}>
              SATYA PHYSIOTHERAPY CLINIC
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Appointment & Consultation Desk
            </h2>
          </div>
        </div>
      </div>

      {/* Main Full-Screen Body */}
      <div style={{ padding: '2.5rem 2rem', maxWidth: '1100px', margin: '0 auto', width: '100%', boxSizing: 'border-box', flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {confirmation ? (
          /* Confirmation Screen */
          <div style={{ background: '#0d152a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '3rem 2rem', textAlign: 'center', maxWidth: '700px', margin: '2rem auto', width: '100%' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 180, 147, 0.15)', color: '#00b493', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle2 size={48} />
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
              {confirmation.type === 'home'
                ? 'Home Physiotherapy Visit Scheduled!'
                : confirmation.type === 'in-person'
                ? 'In-Person Clinic Visit Scheduled!'
                : 'Online Consultation Request Received!'}
            </h3>
            <div style={{ display: 'inline-block', background: 'rgba(0, 180, 147, 0.2)', border: '1px solid #00b493', color: '#00b493', padding: '0.4rem 1.2rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Reference ID: <strong>{confirmation.id}</strong>
            </div>

            <div style={{ background: '#080e1e', border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem', fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              {confirmation.type === 'home' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div><strong style={{ color: '#ffffff' }}>Appointment Type:</strong> Home Physiotherapy (Physiotherapist Visits Home)</div>
                  <div><strong style={{ color: '#ffffff' }}>Physiotherapist:</strong> {confirmation.data.specialist}</div>
                  <div><strong style={{ color: '#ffffff' }}>Treatment Service:</strong> {confirmation.data.service}</div>
                  <div><strong style={{ color: '#ffffff' }}>Scheduled Date & Time:</strong> {confirmation.data.date} at {confirmation.data.timeSlot}</div>
                  <div><strong style={{ color: '#ffffff' }}>Patient Name:</strong> {confirmation.data.patientName}</div>
                  <div><strong style={{ color: '#ffffff' }}>Home Visit Address:</strong> {confirmation.data.homeAddress}, {confirmation.data.cityArea}</div>
                  <div><strong style={{ color: '#ffffff' }}>Payment Status:</strong> Offline (Pending)</div>
                </div>
              ) : confirmation.type === 'in-person' ? (
                <p style={{ margin: 0 }}>Your appointment for <strong style={{ color: '#00b493' }}>{confirmation.data.date}</strong> at <strong style={{ color: '#00b493' }}>{confirmation.data.timeSlot}</strong> with <strong style={{ color: '#ffffff' }}>{confirmation.data.specialist}</strong> has been successfully registered.</p>
              ) : (
                <p style={{ margin: 0 }}>Our clinical team will review your submitted symptoms and medical reports for <strong style={{ color: '#00b493' }}>{confirmation.data.preferredDate} ({confirmation.data.preferredTime})</strong> and contact your phone number <strong style={{ color: '#ffffff' }}>{confirmation.data.phone}</strong> shortly.</p>
              )}
            </div>

            <button className="btn btn-teal" onClick={resetAndClose} style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', fontWeight: 700 }}>
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Booking Options Selector Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              
              {/* Option 1: Clinic Visit */}
              <div
                onClick={() => { setBookingType('in-person'); setError(''); }}
                style={{
                  background: bookingType === 'in-person' ? 'rgba(0, 180, 147, 0.12)' : '#0d152a',
                  border: bookingType === 'in-person' ? '2px solid #00b493' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bookingType === 'in-person' ? '#00b493' : 'rgba(255, 255, 255, 0.06)', color: bookingType === 'in-person' ? '#ffffff' : '#00b493', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>Book Clinic Visit</h4>
                  <span style={{ fontSize: '0.825rem', color: '#94a3b8' }}>1-on-1 Assessment at Center</span>
                </div>
              </div>

              {/* Option 2: Home Visit */}
              <div
                onClick={() => { setBookingType('home'); setError(''); }}
                style={{
                  background: bookingType === 'home' ? 'rgba(0, 180, 147, 0.12)' : '#0d152a',
                  border: bookingType === 'home' ? '2px solid #00b493' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bookingType === 'home' ? '#00b493' : 'rgba(255, 255, 255, 0.06)', color: bookingType === 'home' ? '#ffffff' : '#00b493', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Home size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>Book Home Visit</h4>
                  <span style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Physiotherapist Visits Home</span>
                </div>
              </div>

              {/* Option 3: Online Consult */}
              <div
                onClick={() => { setBookingType('online'); setError(''); }}
                style={{
                  background: bookingType === 'online' ? 'rgba(0, 180, 147, 0.12)' : '#0d152a',
                  border: bookingType === 'online' ? '2px solid #00b493' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bookingType === 'online' ? '#00b493' : 'rgba(255, 255, 255, 0.06)', color: bookingType === 'online' ? '#ffffff' : '#00b493', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Video size={24} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>Request Online Consult</h4>
                  <span style={{ fontSize: '0.825rem', color: '#94a3b8' }}>Report & Form Review</span>
                </div>
              </div>

            </div>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '0.85rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Form Section Container */}
            <div style={{ background: '#0d152a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '2.5rem', flex: 1 }}>
              
              {/* Form 1: Clinic Visit */}
              {bookingType === 'in-person' && (
                <form onSubmit={handleInPersonSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00b493', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                    1. Patient & Specialist Information (In-Person Clinic Visit)
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Patient Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Verma"
                        value={inPersonData.patientName}
                        onChange={(e) => setInPersonData({ ...inPersonData, patientName: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={inPersonData.phone}
                        onChange={(e) => setInPersonData({ ...inPersonData, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={inPersonData.email}
                        onChange={(e) => setInPersonData({ ...inPersonData, email: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Treatment Service *</label>
                      <select
                        value={inPersonData.service}
                        onChange={(e) => setInPersonData({ ...inPersonData, service: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      >
                        {services.map((s) => (
                          <option key={s._id || s.title} value={s.title}>{s.title}</option>
                        ))}
                        {services.length === 0 && (
                          <>
                            <option value="Orthopedic Rehabilitation">Orthopedic Rehabilitation</option>
                            <option value="Sports Injury & Performance">Sports Injury & Performance</option>
                            <option value="Neurological Recovery">Neurological Recovery</option>
                            <option value="Class IV Laser & Pain Relief">Class IV Laser & Pain Relief</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Assigned Specialist *</label>
                      <select
                        value={inPersonData.specialist}
                        onChange={(e) => setInPersonData({ ...inPersonData, specialist: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      >
                        {doctors.map((d) => (
                          <option key={d._id || d.name} value={d.name}>{d.name} ({d.title})</option>
                        ))}
                        {doctors.length === 0 && (
                          <>
                            <option value="Dr. Satya Prakash">Dr. Satya Prakash</option>
                            <option value="Dr. Neha Sharma">Dr. Neha Sharma</option>
                            <option value="Dr. Amit Varma">Dr. Amit Varma</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Preferred Date *</label>
                      <input
                        type="date"
                        required
                        value={inPersonData.date}
                        onChange={(e) => setInPersonData({ ...inPersonData, date: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Available Time Slot *</label>
                      <select
                        value={inPersonData.timeSlot}
                        onChange={(e) => setInPersonData({ ...inPersonData, timeSlot: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      >
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:30 PM">05:30 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Symptoms / Clinical Notes (Optional)</label>
                    <textarea
                      rows="3"
                      placeholder="Brief details about back/joint pain, surgery stage, or MRI report..."
                      value={inPersonData.notes}
                      onChange={(e) => setInPersonData({ ...inPersonData, notes: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <button type="button" className="btn btn-outline-white" onClick={resetAndClose} style={{ padding: '0.75rem 1.75rem' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-teal" disabled={loading} style={{ padding: '0.75rem 2rem', fontWeight: 800 }}>
                      {loading ? 'Confirming...' : 'Confirm In-Person Visit'}
                    </button>
                  </div>
                </form>
              )}

              {/* Form 2: Home Visit */}
              {bookingType === 'home' && (
                <form onSubmit={handleHomeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00b493', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                    1. Patient & Location Details (Home Physiotherapy Visit)
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Patient Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Verma"
                        value={homeData.patientName}
                        onChange={(e) => setHomeData({ ...homeData, patientName: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={homeData.phone}
                        onChange={(e) => setHomeData({ ...homeData, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={homeData.email}
                        onChange={(e) => setHomeData({ ...homeData, email: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Treatment Service *</label>
                      <select
                        value={homeData.service}
                        onChange={(e) => setHomeData({ ...homeData, service: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      >
                        {services.map((s) => (
                          <option key={s._id || s.title} value={s.title}>{s.title}</option>
                        ))}
                        {services.length === 0 && (
                          <>
                            <option value="Orthopedic Rehabilitation">Orthopedic Rehabilitation</option>
                            <option value="Sports Injury & Performance">Sports Injury & Performance</option>
                            <option value="Neurological Recovery">Neurological Recovery</option>
                            <option value="Class IV Laser & Pain Relief">Class IV Laser & Pain Relief</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Preferred Physiotherapist *</label>
                      <select
                        value={homeData.specialist}
                        onChange={(e) => setHomeData({ ...homeData, specialist: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      >
                        {doctors.map((d) => (
                          <option key={d._id || d.name} value={d.name}>{d.name} ({d.title})</option>
                        ))}
                        {doctors.length === 0 && (
                          <>
                            <option value="Dr. Satya Prakash">Dr. Satya Prakash</option>
                            <option value="Dr. Neha Sharma">Dr. Neha Sharma</option>
                            <option value="Dr. Amit Varma">Dr. Amit Varma</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Home Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="House/Flat No., Street Name, Landmark"
                        value={homeData.homeAddress}
                        onChange={(e) => setHomeData({ ...homeData, homeAddress: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>City / Area *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sector 62, Noida"
                        value={homeData.cityArea}
                        onChange={(e) => setHomeData({ ...homeData, cityArea: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Preferred Date *</label>
                      <input
                        type="date"
                        required
                        value={homeData.date}
                        onChange={(e) => setHomeData({ ...homeData, date: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Available Time Slot *</label>
                      <select
                        value={homeData.timeSlot}
                        onChange={(e) => setHomeData({ ...homeData, timeSlot: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      >
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:30 PM">05:30 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Additional Notes (Optional)</label>
                    <textarea
                      rows="3"
                      placeholder="Parking instructions, floor details, or specific symptoms..."
                      value={homeData.notes}
                      onChange={(e) => setHomeData({ ...homeData, notes: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <button type="button" className="btn btn-outline-white" onClick={resetAndClose} style={{ padding: '0.75rem 1.75rem' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-teal" disabled={loading} style={{ padding: '0.75rem 2rem', fontWeight: 800 }}>
                      {loading ? 'Confirming...' : 'Confirm Home Visit Booking'}
                    </button>
                  </div>
                </form>
              )}

              {/* Form 3: Online Consult */}
              {bookingType === 'online' && (
                <form onSubmit={handleOnlineSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00b493', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
                    1. Patient & Medical Details (Online Consultation Request)
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Patient Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priya Sharma"
                        value={onlineData.name}
                        onChange={(e) => setOnlineData({ ...onlineData, name: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Contact Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 00000"
                        value={onlineData.phone}
                        onChange={(e) => setOnlineData({ ...onlineData, phone: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={onlineData.email}
                        onChange={(e) => setOnlineData({ ...onlineData, email: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Select Physiotherapist (Optional)</label>
                      <select
                        value={onlineData.physiotherapistId}
                        onChange={(e) => setOnlineData({ ...onlineData, physiotherapistId: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      >
                        <option value="">Any Senior Specialist</option>
                        {doctors.map((d) => (
                          <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Preferred Date *</label>
                      <input
                        type="date"
                        required
                        value={onlineData.preferredDate}
                        onChange={(e) => setOnlineData({ ...onlineData, preferredDate: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Preferred Time Window *</label>
                      <select
                        value={onlineData.preferredTime}
                        onChange={(e) => setOnlineData({ ...onlineData, preferredTime: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                      >
                        <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                        <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12:00 PM - 04:00 PM)</option>
                        <option value="Evening (04:00 PM - 08:00 PM)">Evening (04:00 PM - 08:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Problem / Condition Description *</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Describe your symptoms, pain duration, or post-op recovery..."
                      value={onlineData.condition}
                      onChange={(e) => setOnlineData({ ...onlineData, condition: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', background: '#080e1e', border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '0.95rem' }}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>Upload Medical Reports (MRI, X-Ray, Prescription - Max 5MB)</label>
                    <div style={{ background: '#080e1e', border: '2px dashed #334155', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', position: 'relative' }}>
                      <Upload size={24} style={{ color: '#00b493', marginBottom: '0.5rem' }} />
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                      <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>
                        {selectedFile ? selectedFile.name : 'Click or Drag file to upload (.PDF, .PNG, .JPG)'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <button type="button" className="btn btn-outline-white" onClick={resetAndClose} style={{ padding: '0.75rem 1.75rem' }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-teal" disabled={loading} style={{ padding: '0.75rem 2rem', fontWeight: 800 }}>
                      {loading ? 'Submitting...' : 'Submit Online Consultation Request'}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
