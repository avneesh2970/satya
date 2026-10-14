import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Clock, User, Calendar, Tag, ShieldCheck, ArrowUpRight, ArrowLeft } from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import BookingModal from '../components/booking/BookingModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const fallbackBlogs = [
  {
    _id: 'b1',
    title: "5 Essential Exercises for Decompressing Lower Back Sciatica",
    slug: "5-essential-exercises-lower-back-sciatica",
    category: "Spine & Joint Care",
    author: "Dr. Satya Prakash",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
    excerpt: "Learn how targeted pelvic tilting, cat-cow flexions, and nerve glides reduce herniated disc pressure without surgery.",
    content: `Sciatica pain originating from L4-L5 and L5-S1 lumbar disc herniations can severely impair daily movement. Non-surgical spinal decompression therapy combined with targeted core stabilization exercises helps create negative intra-discal pressure, allowing the bulge to retract away from exiting nerve roots.

1. Pelvic Tilts: Lie flat on your back with knees bent. Gently flatten your spine against the floor by tightening your abdominal muscles. Hold for 5 seconds and repeat 10 times.

2. Cat-Cow Stretch: On all fours, alternate between arching your spine upward and letting your belly sink downward. This gently mobilizes the lumbar facet joints.

3. Nerve Flossing: Sit upright, straighten the affected leg while flexing your ankle upward, then bend your knees while tucking your chin. This releases sciatic nerve entrapment.

4. Cobra Extension: Lie face down and press up through your palms, extending the lower back to promote anterior disc movement.

5. Bird-Dog Stabilization: Maintain a neutral spine while extending alternate arm and leg to strengthen deep multifidus muscles.`,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'b2',
    title: "Class IV High-Intensity Laser Therapy vs SWD: Which is Right for Pain?",
    slug: "class-iv-laser-vs-swd-pain-relief",
    category: "Advanced Pain Tech",
    author: "Dr. Satya Prakash & Team",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    excerpt: "Understanding deep tissue photobiomodulation versus shortwave diathermy for chronic inflammation, bursitis, and deep joint stiffness.",
    content: `Modern physical therapy modalities have revolutionized non-surgical pain management. Class IV High-Intensity Laser Therapy operates at 905nm and 810nm wavelengths to deliver deep photonic energy to mitochondria in damaged tissue, accelerating ATP synthesis and cellular repair.

Shortwave Diathermy (SWD), on the other hand, utilizes high-frequency electromagnetic energy to produce deep volumetric heating in muscular layers. While SWD excels at relieving muscle spasms and chronic joint stiffness, Class IV Laser is superior for nerve pain, acute tendonitis, and localized bursitis where deep cellular healing without thermal overload is required.`,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'b3',
    title: "Post-ACL Reconstruction Milestone Timeline & Safe Return-to-Play",
    slug: "post-acl-reconstruction-milestone-timeline",
    category: "Sports Rehab",
    author: "Senior Sports Physiotherapist",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    excerpt: "A phase-by-phase guide from initial graft protection to biomechanical agility drills and functional return to competitive sports.",
    content: `Recovering from Anterior Cruciate Ligament (ACL) reconstruction requires a structured, phase-based rehabilitation protocol. Rushing the process increases the risk of graft failure.

Phase 1 (Weeks 0-4): Focus on full knee extension, patellar mobility, quad activation (straight leg raises), and reducing post-op swelling.

Phase 2 (Weeks 4-12): Progressive weight-bearing, single-leg stance balance training, closed kinetic chain exercises (squats, step-ups), and stationary cycling.

Phase 3 (Months 3-6): Dynamic agility, deceleration drills, plyometrics, and biomechanical movement analysis.

Phase 4 (Months 6-9): Sport-specific drills and limb symmetry index (LSI) testing over 90% before full clearance.`,
    createdAt: new Date().toISOString()
  }
];

export const createBlogSlug = (title) => {
  if (!title) return 'article';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [blog, setBlog] = useState(() => {
    return fallbackBlogs.find((b) => b.slug === slug || b._id === slug || createBlogSlug(b.title) === slug) || fallbackBlogs[0];
  });
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const matchedFallback = fallbackBlogs.find(
      (b) => b.slug === slug || b._id === slug || createBlogSlug(b.title) === slug
    );

    if (matchedFallback) {
      setBlog(matchedFallback);
    }

    // Attempt backend fetch by slug or ID
    api.getBlogBySlug(slug)
      .then((res) => {
        if (res?.data) {
          setBlog(res.data);
        }
      })
      .catch(() => {
        // Fetch all blogs to match if slug endpoint fails
        api.getBlogs().then((res) => {
          const list = res?.data || (Array.isArray(res) ? res : []);
          const found = list.find(
            (b) => b.slug === slug || b._id === slug || createBlogSlug(b.title) === slug
          );
          if (found) setBlog(found);
        }).catch(() => {});
      });
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

  const formattedDate = blog?.createdAt 
    ? new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently Published';

  return (
    <div className="standalone-blog-page">
      <Header />

      {/* --- HERO SHOWCASE WITH 2-COLUMN LAYOUT & FEATURED IMAGE --- */}
      <section className="standalone-service-hero">
        <div className="standalone-hero-container">
          
          {/* LEFT COLUMN: CONTENT */}
          <div className="standalone-hero-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {/* <Link to="/blogs" className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ArrowLeft size={14} /> Back to Blogs
              </Link> */}
              <span className="standalone-tag-pill">{blog.category || "Clinical Insight"}</span>
            </div>

            <h1 className="standalone-hero-title">{blog.title}</h1>
            {blog.excerpt && <p className="standalone-hero-desc">{blog.excerpt}</p>}

            {/* Quick Meta Metrics */}
            <div className="standalone-quick-metrics">
              <div className="standalone-metric-item">
                <User size={18} color="#00b493" />
                <div>
                  <span className="metric-label">Author</span>
                  <strong className="metric-val">{blog.author || "Satya Clinical Team"}</strong>
                </div>
              </div>

              <div className="standalone-metric-item">
                <Calendar size={18} color="#00b493" />
                <div>
                  <span className="metric-label">Published</span>
                  <strong className="metric-val">{formattedDate}</strong>
                </div>
              </div>

              {blog.readTime && (
                <div className="standalone-metric-item">
                  <Clock size={18} color="#00b493" />
                  <div>
                    <span className="metric-label">Reading Time</span>
                    <strong className="metric-val">{blog.readTime}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: FEATURED IMAGE */}
          {blog.image && (
            <div className="standalone-hero-media">
              <div className="standalone-media-frame">
                <img src={blog.image} alt={blog.title} className="standalone-feature-img" />
              </div>
            </div>
          )}

        </div>
      </section>

      {/* --- STANDALONE BLOG ARTICLE CONTENT BODY --- */}
      <section className="standalone-overview-section">
        <div className="standalone-wide-container">
          <div className="standalone-article-wrapper">
            
            <div className="standalone-article-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00b493', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={18} />
                <span>Verified Clinical Article</span>
              </div>
              <h2 className="standalone-section-heading" style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 700 }}>
                {blog.title}
              </h2>
              
              <div className="standalone-article-body">
                {blog.content ? (
                  blog.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} style={{ marginBottom: '1.5rem', lineHeight: 1.85 }}>
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p>{blog.excerpt}</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- STANDALONE CTA BANNER --- */}
      <section className="standalone-cta-banner">
        <div className="standalone-wide-container">
          <div className="standalone-cta-content">
            <h2>Need Personalized Physical Therapy Guidance?</h2>
            <p>Consult with Dr. Satya Prakash and our senior MPT physical therapy team for targeted non-surgical rehabilitation.</p>
            
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

export default BlogDetailPage;
