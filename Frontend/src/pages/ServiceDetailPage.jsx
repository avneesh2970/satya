import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Clock, ShieldCheck, CheckCircle2, ArrowRight, ArrowUpRight, 
  Phone, MapPin, Home, Calendar, ChevronLeft, Activity, 
  Bone, Brain, HeartPulse, Flame, UserCheck, Award, Stethoscope, Sparkles
} from 'lucide-react';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import BookingModal from '../components/booking/BookingModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

export const defaultServicesData = [
  {
    slug: 'orthopedic-rehabilitation',
    icon: <Bone size={26} />,
    title: 'Orthopedic Rehabilitation',
    tag: 'JOINT & SPINE CARE',
    category: 'Joint & Spine Care',
    desc: 'Targeted joint mobilization & spinal decompression for arthritis, slip disc, frozen shoulder, and neck pain.',
    fullDesc: 'Our Orthopedic Rehabilitation program focuses on diagnosing and treating musculoskeletal disorders involving joint stiffness, acute back pain, spinal disc herniation, and chronic joint degeneration. Utilizing evidence-based manual therapy, joint mobilization, and targeted biomechanical re-education, we reduce inflammation, decompress nerve roots, and restore full range of motion.',
    benefits: [
      'Significant reduction in chronic joint and back pain without surgery.',
      'Enhanced joint mobility, flexibility, and spinal decompression.',
      'Rebuilding muscular support around vulnerable joints to prevent relapse.',
      'Targeted spinal posture correction and disc unloading.'
    ],
    conditions: [
      'Lumbar & Cervical Slip Disc / Herniation',
      'Frozen Shoulder & Rotator Cuff Tendonitis',
      'Osteoarthritis (Knee, Hip & Spine)',
      'Sciatica & Nerve Entrapment',
      'Chronic Low Back & Neck Stiffness'
    ],
    duration: '45-60 mins / session',
    sessionInfo: '1-on-1 Senior Physiotherapist Care',
    price: '₹1,200 / session',
    image: '/images/ortho.jpg'
  },
  {
    slug: 'sports-injury-performance',
    icon: <Activity size={26} />,
    title: 'Sports Injury & Performance',
    tag: 'ATHLETIC REHAB & GAIT',
    category: 'Athletic Performance',
    desc: 'Rapid rehabilitation for ACL tears, ankle sprains, muscle tears, and athletic gait optimization.',
    fullDesc: 'Designed for athletes and active individuals, our Sports Injury program combines rapid phase-based tissue healing with sport-specific movement retraining. We focus on ACL/PCL ligament rehab, acute ankle sprains, hamstring strain recovery, and kinetic chain strengthening to ensure safe return-to-play.',
    benefits: [
      'Accelerated ligament, tendon, and muscle recovery.',
      'Biomechanical movement analysis to eliminate compensation patterns.',
      'High-level agility, power, and kinetic stability rebuild.',
      'Custom return-to-sport testing and injury prevention protocols.'
    ],
    conditions: [
      'ACL / PCL / Meniscus Tears (Pre & Post-Op)',
      'Ankle Sprains & Plantar Fasciitis',
      'Muscle Strain (Hamstring, Quadriceps, Calf)',
      'Tennis Elbow & Golfer’s Elbow',
      'Shin Splints & Runner’s Knee'
    ],
    duration: '45-60 mins / session',
    sessionInfo: 'Sport-Specific Movement & Dynamic Rehab',
    price: '₹1,200 / session',
    image: '/images/sports.jpeg'
  },
  {
    slug: 'neurological-recovery',
    icon: <Brain size={26} />,
    title: 'Neurological Recovery',
    tag: 'NEURO-REHABILITATION',
    category: 'Neuro-Rehabilitation',
    desc: 'Specialized neuro-rehab for stroke recovery, nerve compression, balance disorders, and Parkinson’s.',
    fullDesc: "Neurological rehabilitation relies on neuroplasticity — the brain's ability to form new neural pathways after illness or injury. Our specialized neuro-physiotherapists guide stroke survivors, neuropathy patients, and those with Parkinson's disease through sensory motor re-education, gait re-training, and balance enhancement.",
    benefits: [
      'Stimulating neuroplasticity to recover lost functional movement.',
      'Fall prevention through advanced balance and vestibular training.',
      'Improving independence in daily walking, transfer, and hand function.',
      'Spasticity management and muscle tone normalization.'
    ],
    conditions: [
      'Post-Stroke Hemiplegia & Paresis',
      'Parkinson’s Disease & Movement Disorders',
      'Peripheral Neuropathy & Nerve Compression',
      'Balance & Vestibular Dysfunction',
      'Spinal Cord Injury Functional Rehab'
    ],
    duration: '60 mins / session',
    sessionInfo: 'Specialized Neuro-Physiotherapist Care',
    price: '₹1,500 / session',
    image: '/images/neuro.jpeg'
  },
  {
    slug: 'post-surgical-rehabilitation',
    icon: <HeartPulse size={26} />,
    title: 'Post-Surgical Rehabilitation',
    tag: 'POST-OPERATIVE CARE',
    category: 'Post-Operative Care',
    desc: 'Structured post-op therapy following total knee/hip replacement, arthroscopy, and spine surgery.',
    fullDesc: 'Immediate, structured post-operative physical therapy is critical for joint replacement and surgical success. We work closely with operating surgeons to administer stage-by-stage protocols for total knee replacements (TKR), hip replacements (THR), arthroscopic repairs, and spinal fusions.',
    benefits: [
      'Preventing post-surgical stiffness, scar tissue adhesion, and swelling.',
      'Safe gait re-education from crutches/walker to independent walking.',
      'Maximizing surgical outcomes and regaining full functional power.',
      'Stage-by-stage clinical protocol aligned with surgeon guidelines.'
    ],
    conditions: [
      'Total Knee Replacement (TKR) & Total Hip Replacement (THR)',
      'Arthroscopic Shoulder / Knee Repairs',
      'Spinal Decompression & Fusion Surgery',
      'Post-Fracture Fixation & ORIF Rehab',
      'Ligament Reconstruction Post-Op Care'
    ],
    duration: '45-60 mins / session',
    sessionInfo: 'Phase-by-Phase Surgical Protocols',
    price: '₹1,200 / session',
    image: '/images/Post.jpg'
  },
  {
    slug: 'class-iv-laser-pain-relief',
    icon: <Flame size={26} />,
    title: 'Class IV Laser & Pain Relief',
    tag: 'ADVANCED PAIN TECH',
    category: 'Advanced Pain Tech',
    desc: 'High-intensity laser therapy, SWD, Ultrasound, and TENS for rapid non-surgical pain reduction.',
    fullDesc: 'Class IV High-Intensity Laser Therapy delivers deep photonic energy directly to damaged muscular and tendinous tissue. It penetrates deep layers to trigger ATP cellular production, rapidly lower inflammatory markers, and relieve nerve pain without invasive injections or medication.',
    benefits: [
      'Fast, pain-free, non-surgical cellular healing.',
      'Immediate reduction in pain, spasm, and deep tissue swelling.',
      'Complements manual physical therapy for rapid functional gains.',
      'Zero downtime or invasive injection side effects.'
    ],
    conditions: [
      'Severe Nerve Pain & Sciatica',
      'Acute Bursitis, Tendonitis & Joint Swelling',
      'Chronic Low Back & Neck Stiffness',
      'Heel Spurs & Deep Plantar Inflammation',
      'Myofascial Trigger Point Spasms'
    ],
    duration: '30-45 mins / session',
    sessionInfo: 'Non-Invasive High-Intensity Photobiomodulation',
    price: '₹1,500 / session',
    image: '/images/classIV.jpeg'
  },
  {
    slug: 'ergonomics-posture-care',
    icon: <UserCheck size={26} />,
    title: 'Ergonomics & Posture Care',
    tag: 'POSTURE & SPINE ALIGNMENT',
    category: 'Spine & Posture Care',
    desc: 'Desk posture correction, spinal alignment exercises, and workplace injury prevention.',
    fullDesc: 'Modern sedentary and desk-bound lifestyles lead to Forward Head Posture (Tech Neck), rounded shoulders, and severe spinal muscle imbalance. Our Ergonomics & Posture Care program uses computerized alignment assessments, targeted postural correction exercises, and customized workstation ergonomic guidelines.',
    benefits: [
      'Correction of posture deformities and neck/shoulder stress.',
      'Eradicating tension headaches and upper back tightness.',
      'Custom ergonomic setup advice for home and corporate offices.',
      'Long-term core stabilization for sitting tolerance.'
    ],
    conditions: [
      'Forward Head Posture ("Tech Neck") & Upper Cross Syndrome',
      'Computer-Related Repetitive Strain Injury (RSI)',
      'Postural Kyphosis & Scoliosis Management',
      'Chronic Tension Headaches',
      'Desk-Bound Lower Back Stiffness'
    ],
    duration: '45 mins / session',
    sessionInfo: 'Workstation Ergonomics & Posture Analysis',
    price: '₹1,000 / session',
    image: '/images/posture.jpg'
  }
];

export const createServiceSlug = (title) => {
  if (!title) return 'service';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [service, setService] = useState(() => {
    return defaultServicesData.find((s) => s.slug === slug || createServiceSlug(s.title) === slug) || defaultServicesData[0];
  });

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingType, setBookingType] = useState('in-person');

  useEffect(() => {
    window.scrollTo(0, 0);

    const foundInDefault = defaultServicesData.find(
      (s) => s.slug === slug || createServiceSlug(s.title) === slug
    );

    if (foundInDefault) {
      setService(foundInDefault);
    } else {
      api.getServices().then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          const matchedDb = res.data.find(
            (dbSrv) => createServiceSlug(dbSrv.title) === slug
          );
          if (matchedDb) {
            const fallback = defaultServicesData[0];
            setService({
              slug: createServiceSlug(matchedDb.title),
              title: matchedDb.title,
              desc: matchedDb.description || matchedDb.desc || fallback.desc,
              fullDesc: matchedDb.description || fallback.fullDesc,
              image: matchedDb.image || fallback.image,
              duration: matchedDb.duration || fallback.duration,
              price: matchedDb.price || fallback.price,
              tag: matchedDb.category ? matchedDb.category.toUpperCase() : fallback.tag,
              category: matchedDb.category || fallback.category,
              sessionInfo: fallback.sessionInfo,
              benefits: fallback.benefits,
              conditions: fallback.conditions,
              icon: fallback.icon
            });
          }
        }
      }).catch(() => {});
    }
  }, [slug]);

  const handleBookClick = (type = 'in-person') => {
    setBookingType(type);
    if (!user) {
      navigate('/login', {
        state: {
          fromBooking: true,
          returnUrl: location.pathname,
          bookingType: type,
          serviceName: service.title
        }
      });
    } else {
      setIsBookingOpen(true);
    }
  };

  return (
    <div className="standalone-service-page">
      <Header />

      {/* --- SECTION 1: STANDALONE FULL-WIDTH HERO SHOWCASE --- */}
      <section className="standalone-service-hero">
        <div className="standalone-hero-container">
          
          {/* LEFT COLUMN: CONTENT */}
          <div className="standalone-hero-content">
            <span className="standalone-tag-pill">{service.tag}</span>

            <h1 className="standalone-hero-title">{service.title}</h1>
            <p className="standalone-hero-desc">{service.desc}</p>

            {/* Key Quick Info Badges */}
            <div className="standalone-quick-metrics">
              <div className="standalone-metric-item">
                <Clock size={18} color="#00b493" />
                <div>
                  <span className="metric-label">Duration</span>
                  <strong className="metric-val">{service.duration}</strong>
                </div>
              </div>

              <div className="standalone-metric-item">
                <ShieldCheck size={18} color="#00b493" />
                <div>
                  <span className="metric-label">Care Format</span>
                  <strong className="metric-val">{service.sessionInfo}</strong>
                </div>
              </div>

              <div className="standalone-metric-item">
                <Award size={18} color="#00b493" />
                <div>
                  <span className="metric-label">Pricing</span>
                  <strong className="metric-val">{service.price}</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="standalone-hero-actions">
              <button className="btn btn-teal btn-lg" onClick={() => handleBookClick('in-person')}>
                <span>Book Clinic Visit</span>
                <ArrowUpRight size={18} />
              </button>
              <button className="btn btn-outline-light btn-lg" onClick={() => handleBookClick('home')}>
                <Home size={18} />
                <span>Book Home Visit</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: DEDICATED IMAGE CONTAINER */}
          {service.image && (
            <div className="standalone-hero-media">
              <div className="standalone-media-frame">
                <img src={service.image} alt={service.title} className="standalone-feature-img" />
              </div>
            </div>
          )}

        </div>
      </section>

      {/* --- SECTION 2: FULL-WIDTH CLINICAL OVERVIEW & METHODOLOGY --- */}
      <section className="standalone-overview-section">
        <div className="standalone-wide-container">
          <div className="standalone-grid-2col">
            
            <div className="standalone-col-left">
              <span className="standalone-subhead-tag">CLINICAL APPROACH</span>
              <h2 className="standalone-section-heading">Comprehensive Treatment Focus</h2>
              <p className="standalone-overview-paragraph">{service.fullDesc}</p>
            </div>

            <div className="standalone-col-right">
              <div className="standalone-highlights-card">
                <h3>Why Choose Our {service.title}?</h3>
                <ul className="standalone-highlights-list">
                  <li>
                    <Sparkles size={20} className="highlight-icon" />
                    <div>
                      <strong>Evidence-Based Techniques</strong>
                      <p>Utilizing modern biomechanical re-education and manual mobilization.</p>
                    </div>
                  </li>
                  <li>
                    <UserCheck size={20} className="highlight-icon" />
                    <div>
                      <strong>1-on-1 Dedicated Specialist</strong>
                      <p>Direct care from experienced MPT physiotherapists every session.</p>
                    </div>
                  </li>
                  <li>
                    <Activity size={20} className="highlight-icon" />
                    <div>
                      <strong>Measurable Progress Tracking</strong>
                      <p>Objective strength, ROM, and gait assessments at regular intervals.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECTION 3: FULL-WIDTH BENEFITS & CONDITIONS TREATED --- */}
      <section className="standalone-details-section">
        <div className="standalone-wide-container">
          
          <div className="standalone-grid-2col">
            
            {/* Key Benefits Block */}
            <div className="standalone-detail-card">
              <div className="card-header-flex">
                <ShieldCheck size={24} color="#00b493" />
                <h2>Key Treatment Benefits</h2>
              </div>
              <p className="card-sub-desc">Expected clinical outcomes and functional gains from this program.</p>
              
              <ul className="standalone-benefits-list">
                {service.benefits.map((benefit, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={20} className="benefit-check-icon" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Conditions Treated Block */}
            <div className="standalone-detail-card">
              <div className="card-header-flex">
                <Stethoscope size={24} color="#00b493" />
                <h2>Conditions & Indications Treated</h2>
              </div>
              <p className="card-sub-desc">Musculoskeletal and neuromuscular conditions addressed by this therapy.</p>
              
              <div className="standalone-conditions-grid">
                {service.conditions.map((condition, idx) => (
                  <div className="standalone-condition-box" key={idx}>
                    <CheckCircle2 size={16} color="#00b493" />
                    <span>{condition}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* --- SECTION 4: FULL-WIDTH TREATMENT PROCESS --- */}
      <section className="standalone-process-section">
        <div className="standalone-wide-container text-center">
          <span className="standalone-subhead-tag">RECOVERY ROADMAP</span>
          <h2 className="standalone-section-heading">What to Expect During Your Recovery</h2>
          
          <div className="standalone-process-grid">
            <div className="process-step-card">
              <div className="step-num">01</div>
              <h4>Detailed Assessment</h4>
              <p>Biomechanical evaluation, range-of-motion testing, and medical history review.</p>
            </div>

            <div className="process-step-card">
              <div className="step-num">02</div>
              <h4>Targeted Therapy</h4>
              <p>Personalized manual therapy, joint mobilization, and advanced pain tech applications.</p>
            </div>

            <div className="process-step-card">
              <div className="step-num">03</div>
              <h4>Rehab & Prevention</h4>
              <p>Progressive strengthening, posture alignment, and long-term home exercise plan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 5: FULL-WIDTH INTERACTIVE BOOKING CTA BANNER --- */}
      <section className="standalone-cta-banner">
        <div className="standalone-wide-container">
          <div className="standalone-cta-content">
            <h2>Ready to Begin Your Recovery for {service.title}?</h2>
            <p>Schedule a 1-on-1 clinical evaluation with our senior MPT physiotherapists today.</p>
            
            <div className="standalone-cta-buttons">
              <button className="btn btn-teal btn-lg" onClick={() => handleBookClick('in-person')}>
                <span>Book Clinic Consultation</span>
                <ArrowUpRight size={18} />
              </button>
              <button className="btn btn-outline-light btn-lg" onClick={() => handleBookClick('home')}>
                <Home size={18} />
                <span>Book Home Visit</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Appointment Booking Modal */}
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)}
        initialType={bookingType}
      />

      <Footer />
    </div>
  );
};

export default ServiceDetailPage;
