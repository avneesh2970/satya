import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Award, ChevronRight, Eye, Calendar, MapPin, Video } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DoctorProfileModal from './DoctorProfileModal';

const DoctorDirectory = ({ onSelectBooking }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const handleBookingSelect = (type = 'in-person', doc = null) => {
    if (!user) {
      setSelectedDoctor(null);
      navigate('/login', {
        state: {
          fromBooking: true,
          returnUrl: location.pathname,
          bookingType: type,
          preselectedDoctor: doc
        }
      });
    } else {
      if (onSelectBooking) {
        onSelectBooking(type, doc);
      }
    }
  };

  const specializations = [
    { id: 'all', label: 'All Specializations' },
    { id: 'Spine', label: 'Spine & Joint' },
    { id: 'Neuro', label: 'Neurology' },
    { id: 'Sports', label: 'Sports Medicine' },
    { id: 'Post-Op', label: 'Post-Surgical' }
  ];

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.getDoctors(search, specializationFilter);
      setDoctors(res.data || []);
    } catch (err) {
      console.error("Failed to load doctors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, specializationFilter]);

  return (
    <div className="doctor-directory">
      {/* Search & Filter Toolbar */}
      <div className="doc-search-bar-wrap">
        <div className="doc-search-input">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search doctor by name, qualification, or condition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="doc-filter-pills">
          {specializations.map((spec) => (
            <button
              key={spec.id}
              className={`filter-pill ${specializationFilter === spec.id ? 'active' : ''}`}
              onClick={() => setSpecializationFilter(spec.id)}
            >
              {spec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="directory-loading">
          <p>Loading clinical specialists...</p>
        </div>
      ) : doctors.length > 0 ? (
        <div className="doctors-grid">
          {doctors.map((doc) => (
            <div key={doc._id} className="light-card doctor-card">
              <div className="doc-card-top">
                <img src={doc.avatar || doc.profilePhoto || doc.user?.profilePhoto || doc.user?.avatar || "/images/SATYA.jpeg"} alt={doc.name} className="doc-card-avatar" />
                <div className="doc-card-meta">
                  <span className="spec-badge">{doc.specialization}</span>
                  <h3>{doc.name}</h3>
                  <p className="doc-card-title">{doc.title}</p>
                  <p className="doc-card-qual">{doc.qualification}</p>
                </div>
              </div>

              <div className="doc-card-stats">
                <div>
                  <strong>{doc.experienceYears}+ Yrs</strong>
                  <span>Experience</span>
                </div>
                <div>
                  <strong>⭐ {doc.rating || 4.9}</strong>
                  <span>Rating</span>
                </div>
                <div>
                  <strong>{doc.consultationFee || "₹800"}</strong>
                  <span>Fee</span>
                </div>
              </div>

              <div className="doc-card-footer">
                <button
                  className="btn btn-outline-dark doc-btn-sm"
                  onClick={() => setSelectedDoctor(doc)}
                >
                  <Eye size={15} />
                  <span>View Profile</span>
                </button>

                <button
                  className="btn btn-teal doc-btn-sm"
                  onClick={() => handleBookingSelect('in-person', doc)}
                >
                  <Calendar size={15} />
                  <span>Book Visit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="directory-empty">
          <p>No physiotherapists found matching your search criteria.</p>
        </div>
      )}

      {/* Profile Detail Modal */}
      <DoctorProfileModal
        doctor={selectedDoctor}
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        onSelectBooking={handleBookingSelect}
      />
    </div>
  );
};

export default DoctorDirectory;
