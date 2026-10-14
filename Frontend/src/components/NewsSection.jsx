import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowUpRight, AlertCircle, FileText } from 'lucide-react';
import { api } from '../services/api';
import { defaultNewsData, createNewsSlug } from '../pages/NewsDetailPage.jsx';

const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.getNews();
        if (res.data && res.data.length > 0) {
          setNews(res.data);
        } else {
          setNews(defaultNewsData);
        }
      } catch (err) {
        console.error("Failed to load news:", err);
        setNews(defaultNewsData);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <section className="news-section section-padding" id="news">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header-light">
          <span className="section-tag-teal">OFFICIAL ANNOUNCEMENTS & UPDATES</span>
          <h2 className="section-title-dark">
            Clinic News & <span className="serif-italic-teal">Health Bulletins</span>
          </h2>
          <p className="section-subtitle-dark">
            Official announcements, new treatment technologies, health screening camps, and operational updates directly from clinic administration.
          </p>
        </div>

        {/* News Cards Grid */}
        <div className="blog-grid">
          {news.map((item) => {
            const itemSlug = item.slug || createNewsSlug(item.title);
            return (
              <div className="light-card blog-card" key={item._id || itemSlug} style={{ position: 'relative' }}>
                
                {item.important && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    zIndex: 2,
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}>
                    <AlertCircle size={14} /> Urgent Notice
                  </div>
                )}

                {/* News Image Wrapper */}
                <Link to={`/news/${itemSlug}`} className="blog-img-wrapper">
                  <img src={item.image} alt={item.title} className="blog-img" />
                  <span className="blog-category-badge">{item.category}</span>
                </Link>

                {/* News Card Content */}
                <div className="blog-card-body">
                  <div className="blog-meta-row">
                    <span className="blog-meta-item">
                      <FileText size={14} />
                      <span>{item.author || "Satya Admin"}</span>
                    </span>
                    <span className="blog-meta-item">
                      <Calendar size={14} />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  <h3 className="blog-card-title">
                    <Link to={`/news/${itemSlug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {item.title}
                    </Link>
                  </h3>
                  <p className="blog-card-excerpt">{item.summary}</p>

                  <Link to={`/news/${itemSlug}`} className="card-link-teal blog-read-btn">
                    <span>Read Official Announcement</span>
                    <ArrowUpRight size={16} />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default NewsSection;
