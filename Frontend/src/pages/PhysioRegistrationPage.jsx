import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Award, Building, MapPin, Upload, FileCheck,
  CheckCircle2, AlertCircle, Stethoscope, Clock, ShieldCheck, FileText, ArrowRight, Image as ImageIcon
} from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

const PhysioRegistrationPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, loading: authLoading } = useAuth();

  // Redirect guard
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.role === 'patient') {
      navigate('/patient-dashboard', { replace: true });
      return;
    }
    if (user.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
    if (user.role === 'physio') {
      if (user.registrationStatus === 'COMPLETED' && user.approvalStatus === 'PENDING') {
        navigate('/physio/pending-approval', { replace: true });
      } else if (user.approvalStatus === 'APPROVED' && user.isApproved) {
        navigate('/doctor-dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  // Form State
  const [formData, setFormData] = useState({
    qualification: 'MPT',
    customQualification: '',
    specialization: 'Orthopedic Physiotherapy',
    customSpecialization: '',
    experience: '5',
    registrationNumber: '',
    registrationAuthority: 'State Council for Physiotherapy',
    clinicName: '',
    city: '',
    address: '',
    consultationType: 'Both',
    languages: 'English, Hindi',
    bio: '',
    areasOfExpertise: 'Spine Rehab, Sports Injury, Post-Op Care'
  });

  // File States
  const [registrationCertFile, setRegistrationCertFile] = useState(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [certificationsFiles, setCertificationsFiles] = useState([]);

  // File Previews / Names
  const [regCertName, setRegCertName] = useState('');
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [certNames, setCertNames] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegCertChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError('Registration Certificate must be a PDF, JPG, JPEG, or PNG file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Certificate file size must be less than 10MB.');
      return;
    }

    setRegistrationCertFile(file);
    setRegCertName(file.name);
    setError('');
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError('Profile photo must be a JPG, JPEG, or PNG image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile photo size must be less than 5MB.');
      return;
    }

    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleRemoveProfilePhoto = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setProfilePhotoFile(null);
    setProfilePhotoPreview('');
    const input = document.getElementById('profilePhotoInput');
    if (input) input.value = '';
  };

  const handleCertificationsChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (let file of files) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} exceeds 10MB limit.`);
        return;
      }
    }

    setCertificationsFiles(files);
    setCertNames(files.map(f => f.name));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const finalQualification = formData.qualification === 'Other' ? formData.customQualification : formData.qualification;
    const finalSpecialization = formData.specialization === 'Other' ? formData.customSpecialization : formData.specialization;

    if (!finalQualification.trim()) {
      setError('Please specify your Qualification.');
      return;
    }
    if (!finalSpecialization.trim()) {
      setError('Please select your Specialization.');
      return;
    }
    if (!formData.experience || Number(formData.experience) < 0) {
      setError('Please enter valid Years of Experience.');
      return;
    }
    if (!formData.registrationNumber.trim()) {
      setError('Professional Registration Number is required.');
      return;
    }
    if (!formData.registrationAuthority.trim()) {
      setError('Registration Authority / Council is required.');
      return;
    }
    if (!formData.city.trim()) {
      setError('City is required.');
      return;
    }
    if (!formData.consultationType) {
      setError('Consultation Type is required.');
      return;
    }
    if (!registrationCertFile && !user?.registrationCertificate) {
      setError('Professional Registration Certificate file is required.');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('qualification', finalQualification);
      data.append('specialization', finalSpecialization);
      data.append('experience', formData.experience);
      data.append('registrationNumber', formData.registrationNumber);
      data.append('registrationAuthority', formData.registrationAuthority);
      data.append('clinicName', formData.clinicName);
      data.append('city', formData.city);
      data.append('address', formData.address);
      data.append('consultationType', formData.consultationType);
      data.append('languages', formData.languages);
      data.append('bio', formData.bio);
      data.append('areasOfExpertise', formData.areasOfExpertise);

      if (registrationCertFile) {
        data.append('registrationCertificate', registrationCertFile);
      }
      if (profilePhotoFile) {
        data.append('profilePhoto', profilePhotoFile);
      }
      if (certificationsFiles.length > 0) {
        certificationsFiles.forEach(f => data.append('certifications', f));
      }

      await api.submitPhysioRegistration(data);

      setSuccess('Professional Registration Submitted Successfully! Redirecting to approval status...');
      setTimeout(() => {
        window.location.href = '/physio/pending-approval';
      }, 700);
    } catch (err) {
      setError(err.message || 'Submission failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      <Header />

      <section className="login-hero-section section-padding" style={{ minHeight: 'auto', paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          
          {/* Header Banner */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="section-tag-teal">PRACTITIONER VERIFICATION</span>
            <h1 className="login-title" style={{ fontSize: '2.2rem' }}>
              Professional Registration — <span className="serif-italic-teal">Step 2 of 2</span>
            </h1>
            <p className="login-sub" style={{ margin: '0.5rem auto 0', maxWidth: '650px' }}>
              Please provide your clinical credentials, council registration, and practice details to complete your verification under Admin review.
            </p>
          </div>

          <div className="login-glass-card" style={{ padding: '2.25rem 2rem' }}>

            {/* Read-Only Account Basic Info Display */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
                <ShieldCheck size={20} style={{ color: '#00b493' }} />
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Account Basic Details (Pre-filled from Signup)</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Full Name</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', fontWeight: '600', color: '#1e293b' }}>
                    <User size={15} style={{ color: '#00b493' }} />
                    <span>{user?.name || 'Practitioner Name'}</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Email Address</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', fontWeight: '600', color: '#1e293b' }}>
                    <Mail size={15} style={{ color: '#00b493' }} />
                    <span>{user?.email || 'email@example.com'}</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Phone Number</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', fontWeight: '600', color: '#1e293b' }}>
                    <Phone size={15} style={{ color: '#00b493' }} />
                    <span>{user?.phone || 'Contact Number'}</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="auth-alert alert-error" style={{ marginBottom: '1.5rem' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="auth-alert alert-success" style={{ marginBottom: '1.5rem' }}>
                <CheckCircle2 size={18} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="booking-form-body">
              
              {/* SECTION A: PROFESSIONAL DETAILS */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} style={{ color: '#00b493' }} />
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>A. Professional Details</h3>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Qualification *</label>
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="BPT">BPT (Bachelor of Physiotherapy)</option>
                      <option value="MPT">MPT (Master of Physiotherapy)</option>
                      <option value="DPT">DPT (Doctor of Physical Therapy)</option>
                      <option value="Other">Other Qualification</option>
                    </select>
                    {formData.qualification === 'Other' && (
                      <input
                        type="text"
                        name="customQualification"
                        placeholder="Enter custom qualification (e.g. PhD in Sports Rehab)"
                        value={formData.customQualification}
                        onChange={handleInputChange}
                        required
                        style={{ marginTop: '0.5rem' }}
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <label>Primary Specialization *</label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      required
                      className="form-control"
                      style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Orthopedic Physiotherapy">Orthopedic Physiotherapy</option>
                      <option value="Sports Physiotherapy">Sports Physiotherapy</option>
                      <option value="Neurological Physiotherapy">Neurological Physiotherapy</option>
                      <option value="Pediatric Physiotherapy">Pediatric Physiotherapy</option>
                      <option value="Cardiopulmonary Physiotherapy">Cardiopulmonary Physiotherapy</option>
                      <option value="Geriatric Physiotherapy">Geriatric Physiotherapy</option>
                      <option value="Other">Other Specialization</option>
                    </select>
                    {formData.specialization === 'Other' && (
                      <input
                        type="text"
                        name="customSpecialization"
                        placeholder="Enter custom specialization"
                        value={formData.customSpecialization}
                        onChange={handleInputChange}
                        required
                        style={{ marginTop: '0.5rem' }}
                      />
                    )}
                  </div>
                </div>

                <div className="form-grid-3" style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label>Years of Clinical Experience *</label>
                    <input
                      type="number"
                      name="experience"
                      min="0"
                      max="60"
                      required
                      placeholder="e.g. 8"
                      value={formData.experience}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Professional Registration No. *</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      required
                      placeholder="e.g. PR-10293/DELHI"
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Registration Council / Authority *</label>
                    <input
                      type="text"
                      name="registrationAuthority"
                      required
                      placeholder="e.g. DCPTOT / IAP Council"
                      value={formData.registrationAuthority}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: PRACTICE DETAILS */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building size={20} style={{ color: '#00b493' }} />
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>B. Practice Details</h3>
                </div>

                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Clinic / Hospital Name</label>
                    <input
                      type="text"
                      name="clinicName"
                      placeholder="e.g. Apex Joint Care Clinic"
                      value={formData.clinicName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. New Delhi"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Consultation Type *</label>
                    <select
                      name="consultationType"
                      value={formData.consultationType}
                      onChange={handleInputChange}
                      required
                      style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Online">Online Consultation Only</option>
                      <option value="In-Person">In-Person Clinic Visits</option>
                      <option value="Both">Both (Online & In-Person)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Full Clinic / Workplace Address</label>
                  <textarea
                    name="address"
                    rows="2"
                    placeholder="Enter full address of your primary clinic or hospital practice..."
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* SECTION C: VERIFICATION DOCUMENTS */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCheck size={20} style={{ color: '#00b493' }} />
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>C. Verification Documents</h3>
                </div>

                <div className="form-grid-2">
                  {/* 10. Registration Certificate */}
                  <div className="form-group">
                    <label>Professional Registration Certificate * (PDF, JPG, PNG)</label>
                    <div className="file-upload-box" style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '1rem', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}>
                      <input
                        type="file"
                        id="regCertInput"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleRegCertChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="regCertInput" style={{ cursor: 'pointer', margin: 0, display: 'block' }}>
                        <Upload size={24} style={{ color: '#00b493', marginBottom: '0.3rem' }} />
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                          {regCertName ? regCertName : 'Click to Upload Council Certificate'}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Allowed: PDF, JPG, JPEG, PNG (Max 10MB)</span>
                      </label>
                    </div>
                  </div>

                  {/* 11. Profile Photo */}
                  <div className="form-group">
                    <label>Profile Photo (JPG, PNG, WEBP)</label>
                    <div className="file-upload-box" style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '1.25rem', textAlign: 'center', background: '#f8fafc', position: 'relative' }}>
                      <input
                        type="file"
                        id="profilePhotoInput"
                        accept=".jpg,.jpeg,.png,.webp"
                        onChange={handleProfilePhotoChange}
                        style={{ display: 'none' }}
                      />
                      {profilePhotoPreview ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                          <img src={profilePhotoPreview} alt="Preview" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00b493' }} />
                          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>
                            {profilePhotoFile ? profilePhotoFile.name : 'Selected Photo'}
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveProfilePhoto}
                            style={{
                              background: '#fee2e2',
                              border: '1px solid #fca5a5',
                              color: '#dc2626',
                              padding: '0.35rem 0.85rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <X size={14} /> Remove Photo
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="profilePhotoInput" style={{ cursor: 'pointer', margin: 0, display: 'block' }}>
                          <ImageIcon size={28} style={{ color: '#00b493', marginBottom: '0.35rem' }} />
                          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' }}>
                            Upload Profile Photo
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Formal clinical portrait recommended (.JPG, .PNG, .WEBP)</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* 12. Additional Certifications */}
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Additional Certifications (Optional)</label>
                  <div className="file-upload-box" style={{ border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '0.85rem', background: '#ffffff' }}>
                    <input
                      type="file"
                      id="certsInput"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleCertificationsChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="certsInput" style={{ cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={20} style={{ color: '#00b493' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                          {certNames.length > 0 ? certNames.join(', ') : 'Upload Fellowship / Specialized Rehab Certifications'}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Select multiple files if needed</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION D: ADDITIONAL PROFESSIONAL INFORMATION */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Stethoscope size={20} style={{ color: '#00b493' }} />
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>D. Additional Professional Information</h3>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Languages Spoken</label>
                    <input
                      type="text"
                      name="languages"
                      placeholder="e.g. English, Hindi, Punjabi"
                      value={formData.languages}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Areas of Expertise (Comma Separated)</label>
                    <input
                      type="text"
                      name="areasOfExpertise"
                      placeholder="e.g. Sciatica Decompression, ACL Rehab, Laser Therapy"
                      value={formData.areasOfExpertise}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Professional Bio / Summary</label>
                  <textarea
                    name="bio"
                    rows="3"
                    placeholder="Brief description of your clinical methodology, patient approach, and background..."
                    value={formData.bio}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', textAlign: 'right' }}>
                <button type="submit" className="btn btn-teal auth-submit-btn" style={{ maxWidth: '320px', marginLeft: 'auto' }} disabled={loading}>
                  {loading ? (
                    <span>Submitting Registration...</span>
                  ) : (
                    <>
                      <span>Submit Registration for Review</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PhysioRegistrationPage;
