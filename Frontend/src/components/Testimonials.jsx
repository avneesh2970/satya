import React, { useRef, useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

const defaultStories = [
  {
    name: 'Rajesh Malhotra',
    role: 'L4-L5 Disc Herniation Patient',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    quote: 'I was advised surgery for my sciatica pain. Dr. Satya’s decompression and core stabilization protocol got me back to walking without pain in 4 weeks. Truly life-changing care!',
    stars: 5,
    tag: 'Pain-Free in 4 Weeks'
  },
  {
    name: 'Priya Sundaram',
    role: 'Post ACL Reconstruction Athlete',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    quote: 'The sports rehab program at Satya was incredibly methodical. From gait retraining to agility drills, they gave me complete confidence to return to marathon running.',
    stars: 5,
    tag: 'Returned to Running'
  },
  {
    name: 'Anil Kapoor',
    role: 'Frozen Shoulder Patient',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    quote: 'Six months of shoulder stiffness vanished in 3 weeks with Class IV laser therapy and joint mobilization. Punctual, clean, and extremely professional doctors.',
    stars: 5,
    tag: 'Full Mobility Restored'
  },
  {
    name: 'Sunita Sharma',
    role: 'Cervical Spondylosis Care',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    quote: 'Severe neck tightness and numbness in my fingers used to interrupt my work daily. The targeted manual therapy and posture correction exercises worked wonders!',
    stars: 5,
    tag: '100% Non-Surgical Care'
  },
  {
    name: 'Vikram Sethi',
    role: 'Total Knee Replacement Rehab',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    quote: 'After my knee replacement, getting back on my feet felt daunting. The team guided me step-by-step with patient care. I was climbing stairs within 3 weeks!',
    stars: 5,
    tag: 'Post-Op Knee Rehab'
  },
  {
    name: 'Kavita Reddy',
    role: 'Posture & Sciatica Recovery',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    quote: 'Years of computer desk work ruined my posture and caused severe lower back aches. The ergonomic guidance and core alignment exercises eliminated the pain.',
    stars: 5,
    tag: 'Zero Back Pain'
  }
];

const Testimonials = () => {
  const marqueeRef = useRef(null);
  const [stories, setStories] = useState(defaultStories);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await api.getTestimonials();
        if (res?.data && res.data.length > 0) {
          const formatted = res.data.map(item => ({
            name: item.patientName || item.name || 'Patient',
            role: item.patientRole || item.role || 'Recovery Patient',
            avatar: item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            quote: item.quote || item.content || '',
            stars: Number(item.stars || item.rating || 5),
            tag: item.tag || item.outcomeTag || 'Recovery Milestone'
          }));
          setStories(formatted);
        }
      } catch (err) {
        console.error("Error fetching testimonials for home page:", err);
      }
    };
    fetchTestimonials();
  }, []);

  // Duplicate stories to create mathematically seamless 100% infinite marquee loop
  const infiniteStories = [...stories, ...stories];

  const handleScrollLeft = () => {
    if (marqueeRef.current) {
      marqueeRef.current.scrollBy({ left: -390, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (marqueeRef.current) {
      marqueeRef.current.scrollBy({ left: 390, behavior: 'smooth' });
    }
  };

  return (
    <section className="testimonials-section section-padding" id="testimonials">
      <div className="container">
        
        <div className="section-header-light">
          <span className="section-tag-teal">PATIENT STORIES</span>
          <h2 className="section-title-dark">
            Real Recovery <span className="serif-italic-teal">Milestones</span>
          </h2>
          <p className="section-subtitle-dark">
            Hear from real patients who reclaimed their mobility and active lifestyle at Satya Physiotherapy Center.
          </p>
        </div>

      </div>

      {/* Infinite Moving Marquee Container */}
      <div className="infinite-marquee-viewport">
        <div className="infinite-marquee-track" ref={marqueeRef}>
          {infiniteStories.map((story, idx) => (
            <div className="marquee-card-item" key={idx}>
              <div className="light-card review-card-enhanced">
                
                {/* Top Header: Quote Icon & Gold Stars */}
                <div className="review-top">
                  <Quote size={28} className="quote-teal" />
                  <div className="stars-wrap">
                    {[...Array(story.stars)].map((_, i) => (
                      <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                </div>

                {/* Patient Quote Body */}
                <p className="review-quote-dark">"{story.quote}"</p>

                {/* Outcome Tag Pill */}
                <div className="story-outcome-pill">
                  <span>{story.tag}</span>
                </div>

                {/* Patient Profile Row with Unsplash Avatar & Verified Badge */}
                <div className="reviewer-profile-row">
                  <div className="reviewer-avatar-wrap">
                    <img src={story.avatar} alt={story.name} className="reviewer-avatar-img" />
                    <div className="verified-badge-mini" title="Verified Patient">
                      <CheckCircle2 size={11} />
                    </div>
                  </div>
                  <div className="reviewer-meta">
                    <strong>{story.name}</strong>
                    <span>{story.role}</span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default Testimonials;
