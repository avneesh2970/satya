import React from 'react';
import Header from '../components/common/Header.jsx';
import Services from '../components/Services.jsx';
import Footer from '../components/common/Footer.jsx';

const ServicesPage = () => {
  return (
    <div className="services-page">
      <Header />
      
      {/* Services Hero Banner */}
      <section className="about-hero-section">
        <div className="hero-bg-wrapper">
          <video 
            src="/videos/v2.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="hero-bg-video"
            style={{ opacity: 0.45 }}
          />
          <div className="hero-bg-overlay"></div>
        </div>

        <div className="hero-ambient-glow glow-1"></div>
        <div className="hero-ambient-glow glow-2"></div>
        <div className="container relative-z">
          <div className="about-hero-content animate-fade-in-up">
            <span className="section-tag-teal tag-pulse">CLINICAL SERVICES</span>
            <h1 className="about-hero-title">
              Specialized Physical Therapy & <br />
              <span className="serif-italic-teal glow-shimmer">Advanced Rehabilitation</span>
            </h1>
            <p className="about-hero-sub">
              From orthopedic joint mobilization to high-intensity Class IV laser therapy, we provide targeted non-invasive treatments tailored to your condition.
            </p>
          </div>
        </div>
      </section>

      {/* Services Catalog & Detail Modal */}
      <Services isHomePage={false} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ServicesPage;
