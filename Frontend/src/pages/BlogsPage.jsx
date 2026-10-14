import React from 'react';
import Header from '../components/common/Header.jsx';
import BlogSection from '../components/BlogSection.jsx';
import Footer from '../components/common/Footer.jsx';

const BlogsPage = () => {
  return (
    <div className="blogs-page">
      <Header />
      
      {/* Blogs Hero Banner */}
      <section className="about-hero-section">
        <div className="hero-ambient-glow glow-1"></div>
        <div className="hero-ambient-glow glow-2"></div>
        <div className="container relative-z">
          <div className="about-hero-content animate-fade-in-up">
            <span className="section-tag-teal tag-pulse">CLINICAL KNOWLEDGE & INSIGHTS</span>
            <h1 className="about-hero-title">
              Physiotherapy & <br />
              <span className="serif-italic-teal glow-shimmer">Recovery Articles</span>
            </h1>
            <p className="about-hero-sub">
              Expert guides, non-surgical pain management techniques, and evidence-based rehabilitation insights authored by our senior physical therapy team.
            </p>

            <div className="contact-quick-badges about-hero-badges">
              <div className="quick-badge-item animated-float-1">
                <span>📚 Expert Clinical Guides</span>
              </div>
              <div className="quick-badge-item animated-float-2">
                <span>🔬 Evidence-Based Protocols</span>
              </div>
              <div className="quick-badge-item animated-float-3">
                <span>🩺 Authored by MPT Specialists</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Blog Articles Grid & Detail View */}
      <BlogSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BlogsPage;
