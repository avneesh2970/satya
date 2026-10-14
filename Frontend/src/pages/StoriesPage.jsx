import React from 'react';
import Header from '../components/common/Header.jsx';
import Testimonials from '../components/Testimonials.jsx';
import Footer from '../components/common/Footer.jsx';

const StoriesPage = () => {
  return (
    <div className="stories-page">
      <Header />
      
      {/* Stories Hero Banner */}
      <section className="about-hero-section">
        <div className="hero-ambient-glow glow-1"></div>
        <div className="hero-ambient-glow glow-2"></div>
        <div className="container relative-z">
          <div className="about-hero-content animate-fade-in-up">
            <span className="section-tag-teal tag-pulse">PATIENT RECOVERY STORIES</span>
            <h1 className="about-hero-title">
              Real Milestones & <br />
              <span className="serif-italic-teal glow-shimmer">Verified Patient Outcomes</span>
            </h1>
            <p className="about-hero-sub">
              Explore how our evidence-based rehabilitation protocols have helped thousands of patients overcome disc herniations, ACL tears, and chronic joint pain.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Grid & Continuous Marquee */}
      <Testimonials />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StoriesPage;
