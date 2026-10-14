import React from 'react';
import { X, Star, Award, Clock, Calendar, CheckCircle2, Video, MapPin, ArrowUpRight } from 'lucide-react';

const DoctorProfileModal = ({ doctor, isOpen, onClose, onSelectBooking }) => {
  if (!isOpen || !doctor) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="doctor-profile-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="doc-modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Doctor Summary Banner */}
        <div className="doc-profile-top">
          <div className="doc-avatar-wrap">
            <img src={doctor.avatar || doctor.profilePhoto || doctor.user?.profilePhoto || doctor.user?.avatar || "/images/SATYA.jpeg"} alt={doctor.name} className="doc-avatar-img" />
          </div>
          <div className="doc-title-info">
            <span className="doc-tag">{doctor.specialization}</span>
            <h2>{doctor.name}</h2>
            <p className="doc-qual">{doctor.title} · {doctor.qualification}</p>
            <div className="doc-meta-pills">
              <span className="meta-pill"><Award size={14} /> {doctor.experienceYears}+ Yrs Clinical Practice</span>
              <span className="meta-pill"><Star size={14} fill="#00b493" color="#00b493" /> {doctor.rating || 4.9} ({doctor.reviewsCount || 120}+ reviews)</span>
            </div>
          </div>
        </div>

        {/* Doctor Details Body */}
        <div className="doc-profile-body">
          <div className="doc-section">
            <h3>Clinical Bio & Expertise</h3>
            <p>{doctor.bio}</p>
          </div>

          <div className="doc-section">
            <h3>Consultation Fee & Working Hours</h3>
            <div className="doc-fee-box">
              <div>
                <span className="fee-label">Standard Assessment Fee</span>
                <strong className="fee-amount">{doctor.consultationFee || "₹800"}</strong>
              </div>
              <div className="fee-duration">
                <Clock size={16} /> 45 Mins Session
              </div>
            </div>
          </div>

          <div className="doc-section">
            <h3>Available Time Slots (Daily)</h3>
            <div className="slots-grid">
              {(doctor.availableSlots || ["09:00 AM", "10:30 AM", "11:30 AM", "02:30 PM", "04:00 PM", "05:30 PM"]).map((slot, i) => (
                <span key={i} className="slot-pill">
                  <CheckCircle2 size={13} /> {slot}
                </span>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="doc-actions-row">
            <button
              className="btn btn-teal doc-action-btn"
              onClick={() => {
                onClose();
                onSelectBooking('in-person', doctor);
              }}
            >
              <MapPin size={18} />
              <span>Book In-Person Visit</span>
            </button>

            <button
              className="btn btn-outline-dark doc-action-btn"
              onClick={() => {
                onClose();
                onSelectBooking('online', doctor);
              }}
            >
              <Video size={18} />
              <span>Request Online Consultation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileModal;
