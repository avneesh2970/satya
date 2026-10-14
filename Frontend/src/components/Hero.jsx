import React, { useState } from 'react';
import { ArrowUpRight, Star, Activity, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BookingModal from './booking/BookingModal.jsx';

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookClick = () => {
    if (!user) {
      navigate('/login', {
        state: {
          fromBooking: true,
          returnUrl: location.pathname,
          bookingType: 'in-person'
        }
      });
    } else {
      setIsBookingOpen(true);
    }
  };

  return (
    <section className="hero-section hero-full-bg" id="home">
      {/* Full Section Background Video with Overlay */}
      <div className="hero-bg-wrapper">
        <video 
          src="/videos/Home.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
          className="hero-bg-video"
        />
        <div className="hero-bg-overlay"></div>
      </div>

      {/* Background Ambient Glow Orbs */}
      <div className="hero-ambient-glow glow-1"></div>
      <div className="hero-ambient-glow glow-2"></div>

      <div className="container hero-container">
        
        {/* Left Vertical Accent Text */}
        <div className="hero-vertical-accent">
          <div className="accent-line"></div>
        </div>

        {/* Hero Main Content */}
        <div className="hero-content">
          <div className="hero-tag">
            <span className="tag-line"></span>
            <span className="tag-text">PHYSIOTHERAPY · REHAB · PERFORMANCE</span>
          </div>

          <h1 className="hero-headline">
            Move better. <br />
            <span className="serif-italic-teal">Heal deeper.</span> <br />
            Live stronger.
          </h1>

          <p className="hero-description">
            Satya Physiotherapy Center pairs evidence-based treatment with genuinely personal care — so you don't just recover, you come back stronger than before.
          </p>

          {/* Hero Action Pill Buttons */}
          <div className="hero-actions">
            <button type="button" className="btn btn-teal hero-btn-glow" onClick={handleBookClick}>
              <span>Book an Assessment</span>
              <ArrowUpRight size={18} />
            </button>
            <a href="#services" className="btn btn-outline">
              <span>Explore Services</span>
            </a>
          </div>

          {/* Bottom Stats Row */}
          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="stat-num">15+</span>
              <span className="stat-label">YEARS OF PRACTICE</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-num">12k+</span>
              <span className="stat-label">RECOVERIES GUIDED</span>
            </div>
            <div className="hero-stat-item">
              <span className="stat-num">98%</span>
              <span className="stat-label">WOULD RECOMMEND US</span>
            </div>
          </div>
        </div>

        {/* Right Floating Glass Badges overlayed on background */}
        <div className="hero-floating-elements">
          <div className="hero-floating-badge badge-top">
            <Activity size={20} color="#00b493" />
            <div>
              <strong>100% Non-Surgical</strong>
              <span>Advanced Evidence Care</span>
            </div>
          </div>

          <div className="hero-floating-badge badge-mid">
            <ShieldCheck size={20} color="#00b493" />
            <div>
              <strong>Senior Specialists</strong>
              <span>Certified Physiotherapists</span>
            </div>
          </div>

          <div className="floating-rating-badge hero-rating-card">
            <div className="stars-row">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#00b493" color="#00b493" />
              ))}
            </div>
            <div className="rating-score">
              <strong>4.9 / 5</strong>
            </div>
            <div className="rating-sub">from 900+ patient reviews</div>
          </div>
        </div>

      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)}
      />
    </section>
  );
};

export default Hero;
