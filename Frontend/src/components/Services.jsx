import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bone, Brain, Activity, HeartPulse, UserCheck, Flame, ArrowUpRight, X, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import BookingModal from './booking/BookingModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';

const Services = ({ isHomePage: isHomeProp }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const isHomePage = isHomeProp !== undefined ? isHomeProp : (location.pathname === '/' || location.pathname === '');

  useEffect(() => {
    if (location.state?.autoOpenBooking) {
      setIsBookingOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleBookClick = (serviceTitle) => {
    if (!user) {
      setSelectedService(null);
      navigate('/login', {
        state: {
          fromBooking: true,
          returnUrl: location.pathname,
          bookingType: 'in-person',
          serviceName: serviceTitle
        }
      });
    } else {
      setSelectedService(null);
      setIsBookingOpen(true);
    }
  };

  const defaultServicesList = [
    {
      icon: <Bone size={26} />,
      title: 'Orthopedic Rehabilitation',
      tag: 'JOINT & SPINE CARE',
      desc: 'Targeted joint mobilization & spinal decompression for arthritis, slip disc, frozen shoulder, and neck pain.',
      fullDesc: 'Our Orthopedic Rehabilitation program focuses on diagnosing and treating musculoskeletal disorders involving joint stiffness, acute back pain, spinal disc herniation, and chronic joint degeneration. Utilizing evidence-based manual therapy, joint mobilization, and targeted biomechanical re-education, we reduce inflammation, decompress nerve roots, and restore full range of motion.',
      benefits: [
        'Significant reduction in chronic joint and back pain without surgery.',
        'Enhanced joint mobility, flexibility, and spinal decompression.',
        'Rebuilding muscular support around vulnerable joints to prevent relapse.'
      ],
      conditions: [
        'Lumbar & Cervical Slip Disc / Herniation',
        'Frozen Shoulder & Rotator Cuff Tendonitis',
        'Osteoarthritis (Knee, Hip & Spine)',
        'Sciatica & Nerve Entrapment'
      ],
      duration: '45-60 mins / session',
      sessionInfo: '1-on-1 Senior Physiotherapist Care',
      image: '/images/ortho.jpg'
    },
    {
      icon: <Activity size={26} />,
      title: 'Sports Injury & Performance',
      tag: 'ATHLETIC REHAB & GAIT',
      desc: 'Rapid rehabilitation for ACL tears, ankle sprains, muscle tears, and athletic gait optimization.',
      fullDesc: 'Designed for athletes and active individuals, our Sports Injury program combines rapid phase-based tissue healing with sport-specific movement retraining. We focus on ACL/PCL ligament rehab, acute ankle sprains, hamstring strain recovery, and kinetic chain strengthening to ensure safe return-to-play.',
      benefits: [
        'Accelerated ligament, tendon, and muscle recovery.',
        'Biomechanical movement analysis to eliminate compensation patterns.',
        'High-level agility, power, and kinetic stability rebuild.'
      ],
      conditions: [
        'ACL / PCL / Meniscus Tears (Pre & Post-Op)',
        'Ankle Sprains & Plantar Fasciitis',
        'Muscle Strain (Hamstring, Quadriceps, Calf)',
        'Tennis Elbow & Golfer’s Elbow'
      ],
      duration: '45-60 mins / session',
      sessionInfo: 'Sport-Specific Movement & Dynamic Rehab',
      image: '/images/sports.jpeg'
    },
    {
      icon: <Brain size={26} />,
      title: 'Neurological Recovery',
      tag: 'NEURO-REHABILITATION',
      desc: 'Specialized neuro-rehab for stroke recovery, nerve compression, balance disorders, and Parkinson’s.',
      fullDesc: "Neurological rehabilitation relies on neuroplasticity — the brain's ability to form new neural pathways after illness or injury. Our specialized neuro-physiotherapists guide stroke survivors, neuropathy patients, and those with Parkinson's disease through sensory motor re-education, gait re-training, and balance enhancement.",
      benefits: [
        'Stimulating neuroplasticity to recover lost functional movement.',
        'Fall prevention through advanced balance and vestibular training.',
        'Improving independence in daily walking, transfer, and hand function.'
      ],
      conditions: [
        'Post-Stroke Hemiplegia & Paresis',
        'Parkinson’s Disease & Movement Disorders',
        'Peripheral Neuropathy & Nerve Compression',
        'Balance & Vestibular Dysfunction'
      ],
      duration: '60 mins / session',
      sessionInfo: 'Specialized Neuro-Physiotherapist Care',
      image: '/images/neuro.jpeg'
    },
    {
      icon: <HeartPulse size={26} />,
      title: 'Post-Surgical Rehabilitation',
      tag: 'POST-OPERATIVE CARE',
      desc: 'Structured post-op therapy following total knee/hip replacement, arthroscopy, and spine surgery.',
      fullDesc: 'Immediate, structured post-operative physical therapy is critical for joint replacement and surgical success. We work closely with operating surgeons to administer stage-by-stage protocols for total knee replacements (TKR), hip replacements (THR), arthroscopic repairs, and spinal fusions.',
      benefits: [
        'Preventing post-surgical stiffness, scar tissue adhesion, and swelling.',
        'Safe gait re-education from crutches/walker to independent walking.',
        'Maximizing surgical outcomes and regaining full functional power.'
      ],
      conditions: [
        'Total Knee Replacement (TKR) & Total Hip Replacement (THR)',
        'Arthroscopic Shoulder / Knee Repairs',
        'Spinal Decompression & Fusion Surgery',
        'Post-Fracture Fixation & ORIF Rehab'
      ],
      duration: '45-60 mins / session',
      sessionInfo: 'Phase-by-Phase Surgical Protocols',
      image: '/images/Post.jpg'
    },
    {
      icon: <Flame size={26} />,
      title: 'Class IV Laser & Pain Relief',
      tag: 'ADVANCED PAIN TECH',
      desc: 'High-intensity laser therapy, SWD, Ultrasound, and TENS for rapid non-surgical pain reduction.',
      fullDesc: 'Class IV High-Intensity Laser Therapy delivers deep photonic energy directly to damaged muscular and tendinous tissue. It penetrates deep layers to trigger ATP cellular production, rapidly lower inflammatory markers, and relieve nerve pain without invasive injections or medication.',
      benefits: [
        'Fast, pain-free, non-surgical cellular healing.',
        'Immediate reduction in pain, spasm, and deep tissue swelling.',
        'Complements manual physical therapy for rapid functional gains.'
      ],
      conditions: [
        'Severe Nerve Pain & Sciatica',
        'Acute Bursitis, Tendonitis & Joint Swelling',
        'Chronic Low Back & Neck Stiffness',
        'Heel Spurs & Deep Plantar Inflammation'
      ],
      duration: '30-45 mins / session',
      sessionInfo: 'Non-Invasive High-Intensity Photobiomodulation',
      image: '/images/classIV.jpeg'
    },
    {
      icon: <UserCheck size={26} />,
      title: 'Ergonomics & Posture Care',
      tag: 'POSTURE & SPINE ALIGNMENT',
      desc: 'Desk posture correction, spinal alignment exercises, and workplace injury prevention.',
      fullDesc: 'Modern sedentary and desk-bound lifestyles lead to Forward Head Posture (Tech Neck), rounded shoulders, and severe spinal muscle imbalance. Our Ergonomics & Posture Care program uses computerized alignment assessments, targeted postural correction exercises, and customized workstation ergonomic guidelines.',
      benefits: [
        'Correction of posture deformities and neck/shoulder stress.',
        'Eradicating tension headaches and upper back tightness.',
        'Custom ergonomic setup advice for home and corporate offices.'
      ],
      conditions: [
        'Forward Head Posture ("Tech Neck") & Upper Cross Syndrome',
        'Computer-Related Repetitive Strain Injury (RSI)',
        'Postural Kyphosis & Scoliosis Management',
        'Chronic Tension Headaches'
      ],
      duration: '45 mins / session',
      sessionInfo: 'Workstation Ergonomics & Posture Analysis',
      image: '/images/posture.jpg'
    }
  ];

  const [allServices, setAllServices] = useState(defaultServicesList);

  useEffect(() => {
    const fetchBackendServices = async () => {
      try {
        const res = await api.getServices();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          const merged = res.data.map((dbSrv) => {
            const dbTitleLower = (dbSrv.title || '').toLowerCase();
            const foundDefault = defaultServicesList.find(
              (d) => d.title.toLowerCase() === dbTitleLower
            );

            let serviceImg = dbSrv.image;
            if (dbTitleLower.includes('posture') || dbTitleLower.includes('ergonomic')) {
              serviceImg = '/images/posture.jpg';
            } else if (dbTitleLower.includes('post-surgical') || dbTitleLower.includes('post surgical') || dbTitleLower.includes('post op') || dbTitleLower.includes('post-op')) {
              serviceImg = '/images/Post.jpg';
            } else if (!serviceImg || serviceImg === '/images/hero_physio.jpg') {
              if (foundDefault?.image) {
                serviceImg = foundDefault.image;
              }
            }

            return {
              title: dbSrv.title,
              desc: dbSrv.description || dbSrv.desc || foundDefault?.desc || '',
              fullDesc: dbSrv.description || foundDefault?.fullDesc || dbSrv.desc,
              image: serviceImg || '/images/hero_physio.jpg',
              duration: dbSrv.duration || foundDefault?.duration || '45 mins',
              price: dbSrv.price || foundDefault?.price || '₹1,200',
              sessionInfo: foundDefault?.sessionInfo || '1-on-1 Clinical Care',
              tag: dbSrv.category ? dbSrv.category.toUpperCase() : (foundDefault?.tag || 'SPECIALIZED CARE'),
              icon: foundDefault?.icon || <Activity size={26} />,
              benefits: foundDefault?.benefits || [
                'Evidence-based non-surgical physical rehabilitation.',
                '1-on-1 personalized assessment and care plan.',
                'Faster recovery and pain reduction.'
              ],
              conditions: foundDefault?.conditions || [
                'Joint & Muscle Stiffness',
                'Acute & Chronic Body Pain',
                'Movement Limitation'
              ]
            };
          });

          setAllServices(merged);
        }
      } catch (err) {
        console.error("Failed to load services from backend:", err);
      }
    };

    fetchBackendServices();
  }, []);

  const displayedServices = isHomePage ? allServices.slice(0, 6) : allServices;

  return (
    <section className="services-section section-padding" id="services">
      <div className="container">
        
        <div className="section-header-light">
          <span className="section-tag-teal">SPECIALIZED CARE</span>
          <h2 className="section-title-dark">
            Evidence-Based <span className="serif-italic-teal">Physical Therapies</span>
          </h2>
          <p className="section-subtitle-dark">
            Tailored treatment plans designed to eliminate pain, restore mobility, and rebuild long-term strength.
          </p>
        </div>

        <div className="services-grid">
          {displayedServices.map((service, idx) => {
            const slug = service.slug || service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const handleServiceClick = () => {
              window.scrollTo(0, 0);
              navigate(`/services/${slug}`);
            };

            return (
              <div className="light-card service-card" key={idx}>
                {service.image && (
                  <div 
                    className="service-card-image-wrapper"
                    onClick={handleServiceClick}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={service.image} alt={service.title} className="service-card-img" />
                  </div>
                )}
                <div className="service-card-body">
                  {!service.image && <div className="card-icon-teal">{service.icon}</div>}
                  <h3>{service.title}</h3>
                  <p>{service.desc}</p>
                  <button 
                    type="button"
                    className="card-link-teal" 
                    onClick={handleServiceClick}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <span>Learn More</span>
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View More Button on Home Page */}
        {isHomePage && (
          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                navigate('/services');
              }}
              className="btn btn-teal"
              style={{
                padding: '0.85rem 2.25rem',
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '50px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                boxShadow: '0 10px 25px -5px rgba(13, 148, 136, 0.35)',
                cursor: 'pointer'
              }}
            >
              <span>View All Treatment Services</span>
              <ArrowUpRight size={18} />
            </button>
          </div>
        )}

      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="service-modal-overlay" onClick={() => setSelectedService(null)}>
          <div className="service-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="service-modal-close" onClick={() => setSelectedService(null)} aria-label="Close modal">
              <X size={20} />
            </button>

            {selectedService.image && (
              <div className="service-modal-banner">
                <img src={selectedService.image} alt={selectedService.title} />
                <span className="service-modal-tag">{selectedService.tag}</span>
              </div>
            )}

            <div className="service-modal-content">
              <div className="service-modal-header">
                <h2>{selectedService.title}</h2>
                <div className="service-modal-meta">
                  <span className="meta-badge"><Clock size={15} /> {selectedService.duration}</span>
                  <span className="meta-badge"><ShieldCheck size={15} /> {selectedService.sessionInfo}</span>
                </div>
              </div>

              <div className="service-modal-body">
                <div className="modal-section">
                  <h3>Overview & Clinical Focus</h3>
                  <p>{selectedService.fullDesc}</p>
                </div>

                <div className="modal-grid-two">
                  <div className="modal-section">
                    <h3>Key Benefits</h3>
                    <ul>
                      {selectedService.benefits.map((b, i) => (
                        <li key={i}><CheckCircle2 size={16} /> <span>{b}</span></li>
                      ))}
                    </ul>
                  </div>

                  <div className="modal-section">
                    <h3>Conditions Treated</h3>
                    <ul>
                      {selectedService.conditions.map((c, i) => (
                        <li key={i}><CheckCircle2 size={16} /> <span>{c}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="service-modal-footer">
                <button 
                  className="btn btn-teal service-modal-book-btn"
                  onClick={() => handleBookClick(selectedService.title)}
                >
                  <span>Book Appointment for {selectedService.title}</span>
                  <ArrowUpRight size={18} />
                </button>
                <button className="btn btn-outline" onClick={() => setSelectedService(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)}
        initialType="in-person"
      />
    </section>
  );
};

export default Services;

