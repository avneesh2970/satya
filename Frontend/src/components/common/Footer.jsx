import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container footer-container">
        
        {/* Column 1: Brand & Tagline */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-logo-wrap">
            <img 
              src="/images/SATYA.jpeg" 
              alt="SATYA Physiotherapy Center Logo" 
              className="footer-logo-img" 
            />
          </Link>
          <p className="footer-tagline">
            Honest, science-backed physical therapy. <br />
            Move better, heal deeper, live stronger — since 2010.
          </p>
        </div>

        {/* Column 2: EXPLORE */}
        <div className="footer-col">
          <h4 className="footer-col-title">EXPLORE</h4>
          <ul className="footer-nav">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/why-satya">Why Satya</Link></li>
            <li><Link to="/stories">Stories</Link></li>
            <li><Link to="/blogs">Blogs</Link></li>
            <li><Link to="/news">News</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Column 3: REACH US */}
        <div className="footer-col reach-col">
          <h4 className="footer-col-title">REACH US</h4>
          <ul className="reach-list">
            <li>
              <Phone size={16} className="reach-icon" />
              <a href="tel:+917500831828">+91 7500831828</a>
            </li>
            <li>
              <Mail size={16} className="reach-icon" />
              <a href="mailto:care@satyaphysio.in">care@satyaphysio.in</a>
            </li>
            <li>
              <Clock size={16} className="reach-icon" />
              <span>Mon–Sat: 8 AM – 8 PM · Sun: 9 AM – 1 PM</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Legal Bar */}
      <div className="footer-bottom-bar">
        <div className="container footer-bottom-flex">
          <p className="copyright">© 2026 Satya Physiotherapy Center. All rights reserved.</p>
          <span className="serif-italic-teal footer-motto">Move better. Heal deeper. Live stronger.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
