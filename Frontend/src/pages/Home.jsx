import React from 'react';
import Header from '../components/common/Header.jsx';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Services from '../components/Services.jsx';
import WhyChooseUs from '../components/WhyChooseUs.jsx';
import Testimonials from '../components/Testimonials.jsx';
import BlogSection from '../components/BlogSection.jsx';
import ContactSection from '../components/ContactSection.jsx';
import FAQ from '../components/FAQ.jsx';
import Footer from '../components/common/Footer.jsx';

const Home = () => {
  return (
    <div className="home-page">
      <Header />
      <Hero />
      <About />
      <Services isHomePage={true} />
      <WhyChooseUs />
      <Testimonials />
      <BlogSection limit={3} showViewMore={true} />
      <ContactSection showHeroBanner={false} showFaq={false} />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Home;
