import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Calendar, FileText, AlertCircle, ArrowUpRight, Home, Share2, Tag, CheckCircle2 } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import BookingModal from '../components/booking/BookingModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const defaultNewsData = [
  {
    _id: 'n1',
    title: "Satya Physiotherapy Launches Advanced Class IV Laser Rehabilitation Unit",
    slug: "satya-launches-class-iv-laser-unit",
    category: "Technology Update",
    author: "Satya Clinic Admin",
    summary: "Our clinic is proud to introduce high-intensity laser therapy for accelerated deep-tissue healing and non-surgical pain management.",
    content: `Satya Physiotherapy Center is excited to announce the installation of the state-of-the-art Class IV High-Intensity Laser Therapy system. Operating at dual 810nm and 905nm wavelengths, this non-invasive technology delivers photonic energy deep into damaged tendons, bursae, and spinal discs.

Key benefits include:
• Up to 70% faster recovery in acute inflammation and tendonitis
• Zero pain, zero downtime during treatments
• Deep mitochondrial stimulation accelerating cellular ATP production

Patients can now book Class IV Laser consultations directly through our online booking system.`,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    important: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'n2',
    title: "Free Community Spine & Posture Screening Camp This Weekend",
    slug: "free-community-spine-posture-screening",
    category: "Community Event",
    author: "Satya Health Team",
    summary: "Join our senior MPT physiotherapists for a complimentary posture assessment, spinal mobility check, and ergometrics consultation.",
    content: `As part of our commitment to preventive orthopedic care, Satya Physiotherapy Center is hosting a Free Community Spine & Posture Health Check on Sunday from 9:00 AM to 1:00 PM at our main clinic facility.

What to expect:
1. Digital Posture & Alignment Analysis
2. Range-of-Motion (ROM) & Flexibility Assessment
3. Personalized Workstation Ergonomics Recommendations

Registration is required. Contact care@satyaphysio.in or call +91 7500831828 to reserve your slot.`,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
    important: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'n3',
    title: "New Extended Evening Clinic Hours Announced for Working Professionals",
    slug: "extended-evening-clinic-hours",
    category: "Clinic Operation",
    author: "Clinic Management",
    summary: "To serve our patients better, appointment slots are now open until 8:30 PM Monday through Saturday.",
    content: `We understand that balancing work schedules with physical therapy rehabilitation can be challenging. Starting this month, Satya Physiotherapy Center has extended its weekday operating hours.

New Schedule:
• Monday – Saturday: 8:00 AM – 8:30 PM
• Sunday: 9:00 AM – 1:00 PM

Evening appointments fill up quickly, so we recommend booking 24–48 hours in advance via our website portal.`,
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    important: false,
    createdAt: new Date().toISOString()
  }
];

export const createNewsSlug = (title) => {
  if (!title) return 'announcement';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const NewsDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [newsItem, setNewsItem] = useState(() => {
    return defaultNewsData.find((n) => n.slug === slug || createNewsSlug(n.title) === slug) || defaultNewsData[0];
  });

  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const found = defaultNewsData.find(
      (n) => n.slug === slug || createNewsSlug(n.title) === slug
    );

    if (found) {
      setNewsItem(found);
    } else {
      api.getNews().then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          const matchedDb = res.data.find(
            (dbItem) => dbItem.slug === slug || createNewsSlug(dbItem.title) === slug
          );
          if (matchedDb) {
            setNewsItem(matchedDb);
          }
        }
      }).catch(() => {});
    }
  }, [slug]);

  const handleBookVisit = () => {
    if (!user) {
      navigate('/login', {
        state: { fromBooking: true, returnUrl: location.pathname }
      });
    } else {
      setIsBookingOpen(true);
    }
  };

  return (
    <div className="standalone-news-page">
      <Header />

      {/* --- HERO SHOWCASE WITH 2-COLUMN LAYOUT & DEDICATED IMAGE CONTAINER --- */}
      <section className="standalone-service-hero">
        <div className="standalone-hero-container">
          
          {/* LEFT COLUMN: CONTENT */}
          <div className="standalone-hero-content">
            <span className="standalone-tag-pill">{newsItem.category || "Official Announcement"}</span>

            <h1 className="standalone-hero-title">{newsItem.title}</h1>
            <p className="standalone-hero-desc">{newsItem.summary}</p>

            {/* Quick Meta Badges */}
            <div className="standalone-quick-metrics">
              <div className="standalone-metric-item">
                <FileText size={18} color="#00b493" />
                <div>
                  <span className="metric-label">Published By</span>
                  <strong className="metric-val">{newsItem.author || "Satya Admin"}</strong>
                </div>
              </div>

              <div className="standalone-metric-item">
                <Calendar size={18} color="#00b493" />
                <div>
                  <span className="metric-label">Date</span>
                  <strong className="metric-val">{new Date(newsItem.createdAt || Date.now()).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DEDICATED IMAGE CONTAINER */}
          {newsItem.image && (
            <div className="standalone-hero-media">
              <div className="standalone-media-frame">
                <img src={newsItem.image} alt={newsItem.title} className="standalone-feature-img" />
              </div>
            </div>
          )}

        </div>
      </section>

      {/* --- STANDALONE NEWS ARTICLE BODY --- */}
      <section className="standalone-overview-section">
        <div className="standalone-wide-container">
          <div className="standalone-article-wrapper">
            
            {newsItem.important && (
              <div className="standalone-urgent-alert mb-4">
                <AlertCircle size={22} color="#dc2626" />
                <div>
                  <strong>Official Priority Announcement</strong>
                  <p>This bulletin contains critical information regarding clinic operations or clinical tech.</p>
                </div>
              </div>
            )}

            <div className="standalone-article-content">
              <h2 className="standalone-section-heading">Official Announcement Details</h2>
              <div className="standalone-article-body">
                {newsItem.content}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- STANDALONE CTA BANNER --- */}
      <section className="standalone-cta-banner">
        <div className="standalone-wide-container">
          <div className="standalone-cta-content">
            <h2>Have Questions About This Update?</h2>
            <p>Our team is available to assist you with appointments, consultations, and medical information.</p>
            
            <div className="standalone-cta-buttons">
              <button className="btn btn-teal btn-lg" onClick={handleBookVisit}>
                <span>Book a Consultation</span>
                <ArrowUpRight size={18} />
              </button>
              <Link to="/contact" className="btn btn-outline-light btn-lg">
                <span>Contact Clinic Team</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default NewsDetailPage;
