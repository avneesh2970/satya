import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../services/api.js';
import '../styles/contact.css';

const ContactSection = ({ showHeroBanner = true, showFaq = true }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      setSubmitError('Please fill out your name, phone number, and message.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        condition: formData.message
      };

      const res = await api.submitInquiry(payload);
      if (res.success) {
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setSubmitError(res.message || 'Failed to send message.');
      }
    } catch (err) {
      setSubmitError(err.message || 'Unable to send message. Please call our helpline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactFaqs = [
    {
      id: 1,
      q: "Do I need a doctor's referral to visit Satya Physiotherapy Center?",
      a: "No, a referral is not required. You can book an assessment directly with our senior MPT physical therapy team. If you have medical reports, X-rays, or MRI scans, please bring them along."
    },
    {
      id: 2,
      q: "How early should I arrive for my first appointment?",
      a: "We recommend arriving 10–15 minutes prior to your scheduled slot to complete initial registration and health documentation."
    },
    {
      id: 3,
      q: "Is dedicated patient parking available at the center?",
      a: "Yes, free dedicated patient parking is available directly at our clinic facility with wheelchair accessible entry."
    },
    {
      id: 4,
      q: "What should I wear for my physical therapy assessment?",
      a: "Wear comfortable, loose-fitting athletic clothing (e.g. t-shirt, shorts, or track pants) that allows our therapists to easily evaluate joint range of motion."
    },
    {
      id: 5,
      q: "How do I cancel or reschedule an appointment?",
      a: "You can call our helpline at +91 7500831828 or manage your appointments directly through your online Patient Dashboard."
    },
    {
      id: 6,
      q: "How long does a typical physical therapy session last?",
      a: "Initial comprehensive assessments take approximately 45 to 60 minutes. Follow-up rehabilitation sessions typically range from 45 to 60 minutes depending on treatment modalities."
    },
    {
      id: 7,
      q: "Do you offer home visit physiotherapy services?",
      a: "Yes! We provide specialized home-based physical therapy for post-surgical recovery, elderly care, and mobility-restricted patients across New Delhi."
    },
    {
      id: 8,
      q: "What advanced pain management technologies do you use?",
      a: "Our center is equipped with Class IV High-Intensity Laser Therapy, Shortwave Diathermy (SWD), Targeted Spinal Decompression, TENS, and IFT modalities."
    },
    {
      id: 9,
      q: "Are treatment costs covered under health insurance policies?",
      a: "We provide detailed itemized medical bills and diagnostic receipts suitable for claiming reimbursement under major health insurance and mediclaim policies."
    },
    {
      id: 10,
      q: "Can I consult a physiotherapist online before visiting?",
      a: "Yes, you can request an online tele-consultation through our portal to discuss your symptoms and medical reports with our specialist team."
    }
  ];

  const leftFaqs = contactFaqs.slice(0, 5);
  const rightFaqs = contactFaqs.slice(5, 10);

  const toggleFaq = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return (
    <div className="clean-contact-wrapper" id="contact">
      {/* HERO BANNER WITH BACKGROUND IMAGE */}
      {showHeroBanner && (
        <section className="clean-contact-hero">
          <div className="hero-ambient-glow glow-1"></div>
          <div className="hero-ambient-glow glow-2"></div>
          <div className="container relative-z">
            <div className="clean-contact-hero-content animate-fade-in-up">
              <span className="clean-tag">CONTACT US</span>
              <h1 className="clean-hero-title">Get in Touch</h1>
              <p className="clean-hero-sub">
                Have questions about our physical therapy services or need to schedule an appointment? Reach out to us.
              </p>
              
              <div className="contact-hero-badges">
                <a href="tel:+917500831828" className="contact-hero-badge">
                  <Phone size={16} />
                  <span>+91 7500831828</span>
                </a>
                <a href="mailto:contact@satyaphysio.com" className="contact-hero-badge">
                  <Mail size={16} />
                  <span>contact@satyaphysio.com</span>
                </a>
                <div className="contact-hero-badge">
                  <MapPin size={16} />
                  <span>Sector 14, New Delhi</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MAIN 2-CARD SIDE-BY-SIDE SECTION */}
      <section className="clean-contact-main section-padding">
        <div className="container">
          <div className="clean-contact-grid">
            
            {/* LEFT CARD BLOCK: CONTACT INFORMATION */}
            <div className="clean-info-card">
              <h2 className="clean-col-heading">Contact Information</h2>
              <p className="clean-col-desc">
                Feel free to reach out directly via phone or email, or visit our clinic during operating hours.
              </p>

              <div className="clean-info-list">
                {/* Phone */}
                <div className="clean-info-item">
                  <div className="clean-icon-box">
                    <Phone size={20} />
                  </div>
                  <div>
                    <span className="clean-info-label">PHONE</span>
                    <a href="tel:+917500831828" className="clean-info-link">+91 7500831828</a>
                  </div>
                </div>

                {/* Email */}
                <div className="clean-info-item">
                  <div className="clean-icon-box">
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className="clean-info-label">EMAIL</span>
                    <a href="mailto:contact@satyaphysio.com" className="clean-info-link">contact@satyaphysio.com</a>
                  </div>
                </div>

                {/* Address */}
                <div className="clean-info-item">
                  <div className="clean-icon-box">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="clean-info-label">CLINIC ADDRESS</span>
                    <p className="clean-info-text">
                      Satya Physiotherapy Center<br />
                      Main Road, Sector 14, New Delhi - 110001
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="clean-info-item">
                  <div className="clean-icon-box">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="clean-info-label">WORKING HOURS</span>
                    <p className="clean-info-text">
                      Monday – Saturday: 8:00 AM – 8:00 PM<br />
                      Sunday: 9:00 AM – 1:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CARD BLOCK: SEND US A MESSAGE FORM */}
            <div className="clean-form-card">
              <h2 className="clean-col-heading">Send Us a Message</h2>
              
              {submitSuccess ? (
                <div className="clean-success-box">
                  <CheckCircle2 size={48} color="#00b493" />
                  <h3>Message Sent Successfully</h3>
                  <p>Thank you for reaching out to Satya Physiotherapy Center. Our team will get back to you shortly.</p>
                  <button 
                    type="button" 
                    className="btn btn-teal" 
                    onClick={() => setSubmitSuccess(false)}
                    style={{ marginTop: '1rem' }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="clean-form">
                  {submitError && (
                    <div className="clean-error-alert">
                      <AlertCircle size={18} />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="clean-form-group">
                    <label htmlFor="clean-name">Full Name <span className="req">*</span></label>
                    <input 
                      type="text" 
                      id="clean-name"
                      name="name" 
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="clean-form-row">
                    <div className="clean-form-group">
                      <label htmlFor="clean-email">Email Address</label>
                      <input 
                        type="email" 
                        id="clean-email"
                        name="email" 
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="clean-form-group">
                      <label htmlFor="clean-phone">Phone Number <span className="req">*</span></label>
                      <input 
                        type="tel" 
                        id="clean-phone"
                        name="phone" 
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="clean-form-group">
                    <label htmlFor="clean-message">Message <span className="req">*</span></label>
                    <textarea 
                      id="clean-message"
                      name="message" 
                      rows="4"
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-teal clean-submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 10 FAQ SECTION: 5 LEFT SIDE & 5 RIGHT SIDE */}
      {showFaq && (
        <section className="clean-faq-section section-padding">
          <div className="container">
            <h2 className="clean-faq-title">Frequently Asked Questions</h2>
            <p className="clean-faq-subtitle">Everything you need to know about visiting Satya Physiotherapy Center</p>

            <div className="clean-faq-2col-grid">
              {/* LEFT COLUMN (5 FAQs) */}
              <div className="clean-faq-col">
                {leftFaqs.map((faq) => {
                  const isOpen = activeFaq === faq.id;
                  return (
                    <div 
                      key={faq.id} 
                      className={`clean-faq-item ${isOpen ? 'active' : ''}`}
                      onClick={() => toggleFaq(faq.id)}
                    >
                      <div className="clean-faq-header">
                        <h3>{faq.q}</h3>
                        {isOpen ? <ChevronUp size={18} color="#00b493" /> : <ChevronDown size={18} color="#64748b" />}
                      </div>
                      {isOpen && <p className="clean-faq-body">{faq.a}</p>}
                    </div>
                  );
                })}
              </div>

              {/* RIGHT COLUMN (5 FAQs) */}
              <div className="clean-faq-col">
                {rightFaqs.map((faq) => {
                  const isOpen = activeFaq === faq.id;
                  return (
                    <div 
                      key={faq.id} 
                      className={`clean-faq-item ${isOpen ? 'active' : ''}`}
                      onClick={() => toggleFaq(faq.id)}
                    >
                      <div className="clean-faq-header">
                        <h3>{faq.q}</h3>
                        {isOpen ? <ChevronUp size={18} color="#00b493" /> : <ChevronDown size={18} color="#64748b" />}
                      </div>
                      {isOpen && <p className="clean-faq-body">{faq.a}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </section>
      )}
    </div>
  );
};

export default ContactSection;
