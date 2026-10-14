import React from 'react';
import Header from '../components/common/Header.jsx';
import NewsSection from '../components/NewsSection.jsx';
import Footer from '../components/common/Footer.jsx';

const NewsPage = () => {
  return (
    <div className="news-page">
      <Header />
      
      {/* News Hero Banner */}
      <section className="about-hero-section">
        <div className="hero-ambient-glow glow-1"></div>
        <div className="hero-ambient-glow glow-2"></div>
        <div className="container relative-z">
          <div className="about-hero-content animate-fade-in-up">
            <span className="section-tag-teal tag-pulse">OFFICIAL CLINIC ANNOUNCEMENTS</span>
            <h1 className="about-hero-title">
              Clinic News & <br />
              <span className="serif-italic-teal glow-shimmer">Health Bulletins</span>
            </h1>
            <p className="about-hero-sub">
              Stay updated with our latest medical equipment additions, community health screening camps, holiday schedules, and official clinic announcements.
            </p>

            <div className="contact-quick-badges about-hero-badges">
              <div className="quick-badge-item animated-float-1">
                <span>📢 Official Announcements</span>
              </div>
              <div className="quick-badge-item animated-float-2">
                <span>🏥 Equipment & Facility Updates</span>
              </div>
              <div className="quick-badge-item animated-float-3">
                <span>🩺 Posted by Clinic Admin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main News Articles Grid & Detail View */}
      <NewsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NewsPage;
