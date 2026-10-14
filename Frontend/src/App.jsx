import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ServiceDetailPage from './pages/ServiceDetailPage.jsx';
import WhySatyaPage from './pages/WhySatyaPage.jsx';
import StoriesPage from './pages/StoriesPage.jsx';
import BlogsPage from './pages/BlogsPage.jsx';
import BlogDetailPage from './pages/BlogDetailPage.jsx';
import NewsPage from './pages/NewsPage.jsx';
import NewsDetailPage from './pages/NewsDetailPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PatientDashboard from './pages/PatientDashboard.jsx';
import DoctorDashboard from './pages/DoctorDashboard.jsx';
import PhysioSignupPage from './pages/PhysioSignupPage.jsx';
import PhysioRegistrationPage from './pages/PhysioRegistrationPage.jsx';
import PhysioPendingApprovalPage from './pages/PhysioPendingApprovalPage.jsx';
import PhysioRejectedPage from './pages/PhysioRejectedPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminPortalLoginPage from './pages/AdminPortalLoginPage.jsx';

import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
          <ScrollToTop />
          <div className="app">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:slug" element={<ServiceDetailPage />} />
              <Route path="/why-satya" element={<WhySatyaPage />} />
              <Route path="/stories" element={<StoriesPage />} />
              <Route path="/blogs" element={<BlogsPage />} />
              <Route path="/blogs/:slug" element={<BlogDetailPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<NewsDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<LoginPage />} />
              <Route path="/admin-portal" element={<AdminPortalLoginPage />} />
              <Route path="/admin/login" element={<AdminPortalLoginPage />} />
              <Route path="/physio/signup" element={<PhysioSignupPage />} />
              <Route path="/physio/register" element={<PhysioRegistrationPage />} />
              <Route path="/physio/pending-approval" element={<PhysioPendingApprovalPage />} />
              <Route path="/physio/rejected" element={<PhysioRejectedPage />} />
              <Route path="/patient-dashboard/*" element={<PatientDashboard />} />
              <Route path="/doctor-dashboard/*" element={<DoctorDashboard />} />
              <Route path="/physio/dashboard/*" element={<DoctorDashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Routes>
          </div>
        </Router>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
