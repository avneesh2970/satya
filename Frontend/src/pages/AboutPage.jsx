import React from 'react';
import Header from '../components/common/Header.jsx';
import About from '../components/About.jsx';
import Footer from '../components/common/Footer.jsx';
import { Award, ShieldCheck, HeartHandshake, Target, Activity, Users } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="about-page">
      <Header />
      
      {/* Dedicated About Page Hero Banner */}
      <section className="about-hero-section">
        <div className="hero-bg-wrapper">
          <video 
            src="/videos/v3.mp4" 
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
            <span className="section-tag-teal tag-pulse">ABOUT SATYA PHYSIOTHERAPY</span>
            <h1 className="about-hero-title">
              Dedicated to Science-Backed Healing & <br />
              <span className="serif-italic-teal glow-shimmer">Personalized Rehabilitation</span>
            </h1>
            <p className="about-hero-sub">
              Since 2010, Satya Physiotherapy Center has helped over 12,000 patients recover from severe joint, spine, neuro, and sports conditions without unnecessary surgery.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Stats Banner */}
      <section className="about-stats-banner">
        <div className="container">
          <div className="stats-banner-grid">
            <div className="stat-banner-item">
              <span className="stat-num glow-text">15+</span>
              <span className="stat-label">Years of Clinical Care</span>
            </div>
            <div className="stat-banner-item">
              <span className="stat-num glow-text">12,000+</span>
              <span className="stat-label">Patients Recovered</span>
            </div>
            <div className="stat-banner-item">
              <span className="stat-num glow-text">98.4%</span>
              <span className="stat-label">Clinical Success Rate</span>
            </div>
            <div className="stat-banner-item">
              <span className="stat-num glow-text">100%</span>
              <span className="stat-label">MPT Senior Specialists</span>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy & Overview Component */}
      <About />

      {/* Clinical Standards & Values */}
      <section className="standards-section section-padding">
        <div className="container">
          <div className="section-header-light">
            <span className="section-tag-teal">OUR CLINICAL COMMITMENT</span>
            <h2 className="section-title-dark">
              Built on <span className="serif-italic-teal">Trust & Results</span>
            </h2>
            <p className="section-subtitle-dark">
              Our core principles guide every single treatment session we conduct.
            </p>
          </div>

          <div className="standards-grid">
            <div className="light-card standard-card">
              <div className="card-icon-teal"><ShieldCheck size={26} /></div>
              <h3>100% Non-Invasive Approach</h3>
              <p>We prioritize natural joint mobilization, muscle retraining, and non-surgical pain reduction protocols.</p>
            </div>

            <div className="light-card standard-card">
              <div className="card-icon-teal"><Award size={26} /></div>
              <h3>Post-Graduate Specialists</h3>
              <p>Every therapist holds a Master’s degree in Physiotherapy (MPT) with advanced certifications in manual osteopathy.</p>
            </div>

            <div className="light-card standard-card">
              <div className="card-icon-teal"><HeartHandshake size={26} /></div>
              <h3>Transparent Recovery Timelines</h3>
              <p>We provide realistic clinical goals and progress tracking so you know exactly when you will recover.</p>
            </div>

            <div className="light-card standard-card">
              <div className="card-icon-teal"><Target size={26} /></div>
              <h3>Root-Cause Focus</h3>
              <p>We target the underlying postural and biomechanical imbalances rather than masking temporary pain symptoms.</p>
            </div>

            <div className="light-card standard-card">
              <div className="card-icon-teal"><Activity size={26} /></div>
              <h3>Advanced Modalities</h3>
              <p>Utilizing Class IV Laser Therapy, Spinal Decompression, and SWD for deep tissue cellular regeneration.</p>
            </div>

            <div className="light-card standard-card">
              <div className="card-icon-teal"><Users size={26} /></div>
              <h3>Dedicated 1-on-1 Care</h3>
              <p>You work directly with your assigned senior specialist throughout your entire rehabilitation journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;
