import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Calendar, Users, DollarSign, Activity, Plus, Search,
  CheckCircle, Clock, AlertCircle, X, Menu, ChevronRight,
  ArrowLeft, MessageSquare, Briefcase, Eye, Trash2, Check, RefreshCw,
  Award, ShieldCheck, Settings, Phone, Mail, FileText, Video, MapPin, LogOut, ArrowRight as ArrowIcon, Star, CheckCircle2, BookOpen,
  Feather, Send, Bookmark, Code, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link2, Quote, Table, RotateCcw, RotateCw, Image as ImageIcon, Tag, Edit3, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Pagination from '../components/common/Pagination';
import '../styles/admin.css';

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const getTabFromUrl = () => {
    let rawTab = searchParams.get('tab');
    if (!rawTab) {
      const pathParts = location.pathname.split('/').filter(Boolean);
      if (pathParts.length > 1 && pathParts[0] === 'admin') {
        rawTab = pathParts[1];
      }
    }
    if (!rawTab) return 'overview';
    if (rawTab === 'online-consultations' || rawTab === 'online') return 'consultations';
    if (rawTab === 'patients') return 'users';
    return rawTab;
  };

  const [activeTab, setActiveTabState] = useState(getTabFromUrl);

  const markNotificationsAsReadIfNeeded = (tabName) => {
    if (tabName !== 'notifications') {
      setNotifications((prev) => {
        const hasUnread = prev.some((n) => !n.read);
        if (hasUnread) {
          api.markAllNotificationsRead().catch((err) => {
            console.error("Failed to mark notifications as read on tab switch:", err);
          });
          return prev.map((n) => ({ ...n, read: true }));
        }
        return prev;
      });
    }
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') {
      navigate('/admin-portal', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const setActiveTab = (newTab, replace = false) => {
    setStatusMsg({ type: '', text: '' });
    setActiveTabState(newTab);
    setSearchParams({ tab: newTab }, { replace });
    setMobileSidebarOpen(false);
    markNotificationsAsReadIfNeeded(newTab);
  };

  useEffect(() => {
    const urlTab = getTabFromUrl();
    if (urlTab !== activeTab) {
      setStatusMsg({ type: '', text: '' });
      setActiveTabState(urlTab);
      markNotificationsAsReadIfNeeded(urlTab);
    }
  }, [location.pathname, location.search]);

  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-dismiss status message after 5 seconds
  useEffect(() => {
    if (statusMsg.text) {
      const timer = setTimeout(() => {
        setStatusMsg({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg.text]);

  // Live Data States
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    totalConsultations: 0,
    totalInquiries: 0,
    unreadInquiries: 0,
    totalEstRevenue: '₹0'
  });
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [services, setServices] = useState([]);
  const [onlineConsultations, setOnlineConsultations] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Announcement',
    summary: '',
    content: '',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    important: false
  });
  const [settings, setSettings] = useState({
    clinicName: 'Satya Physiotherapy Center',
    address: 'Plot 12, Main Ring Road, Lajpat Nagar, New Delhi - 110024',
    phone: '+91 93106 60524',
    emergencyHelpline: '+91 98110 24567',
    email: 'contact@satyaphyseo.com',
    businessHours: 'Mon - Sat: 08:00 AM - 08:00 PM | Sun: 09:00 AM - 02:00 PM',
    siteAnnouncement: 'Welcome to Satya Physiotherapy Center — Evidence-Based Non-Surgical Recovery.'
  });

  // Physio Approvals States
  const [physioApprovals, setPhysioApprovals] = useState([]);
  const [physioFilterStatus, setPhysioFilterStatus] = useState('PENDING'); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
  const [viewPhysioModal, setViewPhysioModal] = useState(null);
  const [rejectPhysioModal, setRejectPhysioModal] = useState({
    isOpen: false,
    physioId: null,
    physioName: '',
    reason: ''
  });

  // Modal States
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [viewDoctorModal, setViewDoctorModal] = useState(null);
  const [newDoctor, setNewDoctor] = useState({
    name: '', qualification: 'MPT (Orthopedics)', experienceYears: 8, specialization: 'Spine & Joint Rehabilitation', consultationFee: '₹800'
  });

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceImageFile, setServiceImageFile] = useState(null);
  const [serviceImagePreview, setServiceImagePreview] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [newService, setNewService] = useState({
    title: '', duration: '45 mins', price: '₹1,200', desc: '', image: '', category: 'Orthopedic Rehabilitation', iconName: 'Activity'
  });

  const handleServiceImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setServiceImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveServiceImage = () => {
    setServiceImageFile(null);
    setServiceImagePreview('');
    setNewService((prev) => ({ ...prev, image: '' }));
  };

  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceImageFile(null);
    setServiceImagePreview('');
    setCustomCategory('');
    setNewService({ title: '', duration: '45 mins', price: '₹1,200', desc: '', image: '', category: 'Orthopedic Rehabilitation', iconName: 'Activity' });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (srv) => {
    setEditingServiceId(srv._id);
    setServiceImageFile(null);
    setServiceImagePreview('');

    const predefinedCategories = [
      'Orthopedic Rehabilitation',
      'Spine & Joint Care',
      'Sports Rehab',
      'Neuro Rehabilitation',
      'Advanced Pain Tech',
      'Post-Operative Recovery'
    ];

    let categoryVal = srv.category || 'Orthopedic Rehabilitation';
    if (!predefinedCategories.includes(categoryVal)) {
      setCustomCategory(categoryVal);
      categoryVal = 'Other / Custom';
    } else {
      setCustomCategory('');
    }

    setNewService({
      title: srv.title || '',
      duration: srv.duration || '45 mins',
      price: srv.price || '₹1,200',
      desc: srv.description || srv.desc || '',
      image: srv.image || '',
      category: categoryVal,
      iconName: srv.iconName || 'Activity'
    });

    setServiceModalOpen(true);
  };

  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState(null);
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    role: 'Patient',
    content: '',
    tag: 'Recovery Milestone',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  });

  // Blog View & Editor States matching reference design
  const [blogViewMode, setBlogViewMode] = useState('list'); // 'list' | 'editor'
  const [editorTab, setEditorTab] = useState('editor'); // 'editor' | 'seo'
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    category: 'Spine & Joint Care',
    author: 'Dr. Satya Prakash & Team',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    excerpt: '',
    content: '',
    status: 'Published',
    tags: ['#SpineHealth', '#Physiotherapy'],
    metaTitle: '',
    metaDesc: '',
    focusKeywords: ''
  });
  const [blogImageFile, setBlogImageFile] = useState(null);
  const [blogImagePreview, setBlogImagePreview] = useState('');

  const handleBlogImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBlogImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBlogImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBlogImage = () => {
    setBlogImageFile(null);
    setBlogImagePreview('');
    setBlogForm((prev) => ({ ...prev, image: '' }));
  };

  const [tagInput, setTagInput] = useState('');
  const [htmlSourceMode, setHtmlSourceMode] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [
        statsRes, aptsRes, docsRes, usersRes, servRes, onlRes, testRes, inqRes, settRes, blogRes, newsRes, notifRes, physioRes
      ] = await Promise.all([
        api.getAdminStats().catch(() => ({ data: null })),
        api.getAdminAppointments().catch(() => ({ data: [] })),
        api.getAdminDoctors().catch(() => ({ data: [] })),
        api.getAdminUsers().catch(() => ({ data: [] })),
        api.getAdminServices().catch(() => ({ data: [] })),
        api.getAdminOnlineConsultations().catch(() => ({ data: [] })),
        api.getAdminTestimonials().catch(() => ({ data: [] })),
        api.getAdminInquiries().catch(() => ({ data: [] })),
        api.getSystemSettings().catch(() => ({ data: null })),
        api.getAdminBlogs().catch(() => api.getBlogs().catch(() => ({ data: [] }))),
        api.getAdminNews().catch(() => api.getNews().catch(() => ({ data: [] }))),
        api.getNotifications().catch(() => ({ data: [] })),
        api.getPhysioApprovals().catch(() => ({ data: [] }))
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      setAppointments(aptsRes?.data || []);
      setDoctors(docsRes?.data || []);
      setUsersList(usersRes?.data || []);
      setServices(servRes?.data || []);
      setOnlineConsultations(onlRes?.data || []);
      setTestimonials(testRes?.data || []);
      setInquiries(inqRes?.data || []);
      setPhysioApprovals(physioRes?.data || []);

      const blogItems = blogRes?.data || (Array.isArray(blogRes) ? blogRes : []);
      setBlogs(blogItems);

      const newsItems = newsRes?.data || (Array.isArray(newsRes) ? newsRes : []);
      setNewsList(newsItems);

      let loadedNotifs = notifRes?.data || [];
      const currentTab = getTabFromUrl();
      if (currentTab !== 'notifications' && loadedNotifs.some((n) => !n.read)) {
        api.markAllNotificationsRead().catch((err) => {
          console.error("Failed to mark notifications as read on initial load:", err);
        });
        loadedNotifs = loadedNotifs.map((n) => ({ ...n, read: true }));
      }
      setNotifications(loadedNotifs);

      if (settRes?.data) setSettings(settRes.data);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePhysio = async (id) => {
    try {
      const res = await api.approvePhysioRegistration(id);
      setStatusMsg({ type: 'success', text: res.message || 'Physiotherapist approved successfully!' });
      if (viewPhysioModal?._id === id) setViewPhysioModal(null);
      loadAdminData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to approve physiotherapist' });
    }
  };

  const handleRejectPhysioSubmit = async (e) => {
    e.preventDefault();
    if (!rejectPhysioModal.physioId) return;
    try {
      const res = await api.rejectPhysioRegistration(rejectPhysioModal.physioId, rejectPhysioModal.reason);
      setStatusMsg({ type: 'success', text: res.message || 'Physiotherapist registration rejected.' });
      if (viewPhysioModal?._id === rejectPhysioModal.physioId) setViewPhysioModal(null);
      setRejectPhysioModal({ isOpen: false, physioId: null, physioName: '', reason: '' });
      loadAdminData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to reject physiotherapist' });
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif || notif.read) return;
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
      );
      await api.markNotificationRead(notif._id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, read: false } : n))
      );
    }
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  // Two-Step Approval Actions for Admin
  const handleApproveAppointment = async (id) => {
    try {
      await api.approveAdminAppointment(id);
      setStatusMsg({ type: 'success', text: 'Appointment APPROVED & sent to physiotherapist!' });
      loadAdminData(false);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to approve appointment' });
    }
  };

  const handleRejectAppointment = async (id) => {
    const reason = window.prompt("Reason for rejecting appointment:");
    if (reason === null) return;
    try {
      await api.rejectAdminAppointment(id, reason);
      setStatusMsg({ type: 'success', text: 'Appointment rejected successfully.' });
      loadAdminData(false);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to reject appointment' });
    }
  };

  // Actions
  const handleVerifyDoctor = async (doctorId) => {
    try {
      await api.verifyDoctor(doctorId);
      setStatusMsg({ type: 'success', text: 'Physiotherapist status updated successfully!' });
      loadAdminData(false);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update physiotherapist status' });
    }
  };

  const handleCreateDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createAdminDoctor(newDoctor);
      setStatusMsg({ type: 'success', text: 'Physiotherapist added successfully!' });
      setDoctorModalOpen(false);
      setNewDoctor({ name: '', qualification: 'MPT (Orthopedics)', experienceYears: 8, specialization: 'Spine & Joint Rehabilitation', consultationFee: '₹800' });
      loadAdminData(false);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to create doctor' });
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      setUsersList((prev) =>
        prev.map((usr) => (usr._id === userId ? { ...usr, role: newRole } : usr))
      );
      const res = await api.updateUserRole(userId, newRole);
      setStatusMsg({ type: 'success', text: res.message || `User role updated to ${newRole.toUpperCase()}` });
      loadAdminData(false);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update role' });
      loadAdminData(false);
    }
  };

  const handleCreateServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const isCustom = newService.category === 'Other / Custom' || newService.category === 'Other';
      const finalCategory = isCustom
        ? (customCategory.trim() || 'Custom Rehabilitation')
        : (newService.category || 'Orthopedic Rehabilitation');

      let payload;
      if (serviceImageFile) {
        payload = new FormData();
        payload.append('image', serviceImageFile);
        payload.append('title', newService.title || '');
        payload.append('category', finalCategory);
        payload.append('duration', newService.duration || '45 mins');
        payload.append('price', newService.price || '₹1,200');
        payload.append('description', newService.desc || newService.description || '');
        payload.append('iconName', newService.iconName || 'Activity');
      } else {
        payload = {
          title: newService.title,
          category: finalCategory,
          duration: newService.duration || '45 mins',
          price: newService.price || '₹1,200',
          description: newService.desc || newService.description || '',
          image: newService.image || '',
          iconName: newService.iconName || 'Activity'
        };
      }

      if (editingServiceId) {
        await api.updateAdminService(editingServiceId, payload);
        setStatusMsg({ type: 'success', text: 'Treatment Service updated successfully!' });
      } else {
        await api.createAdminService(payload);
        setStatusMsg({ type: 'success', text: 'Treatment Service created & picture uploaded successfully!' });
      }

      setServiceModalOpen(false);
      setEditingServiceId(null);
      setServiceImageFile(null);
      setServiceImagePreview('');
      setCustomCategory('');
      setNewService({ title: '', duration: '45 mins', price: '₹1,200', desc: '', image: '', category: 'Orthopedic Rehabilitation', iconName: 'Activity' });
      loadAdminData(false);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save service' });
    }
  };

  // Blog Editor Handlers
  const handleOpenCreateBlog = () => {
    setEditingBlogId(null);
    setBlogImageFile(null);
    setBlogImagePreview('');
    setBlogForm({
      title: '',
      slug: '',
      category: 'Spine & Joint Care',
      author: 'Dr. Satya Prakash & Team',
      readTime: '5 min read',
      image: '',
      excerpt: '',
      content: '',
      status: 'Published',
      tags: ['#SpineHealth', '#Physiotherapy'],
      metaTitle: '',
      metaDesc: '',
      focusKeywords: ''
    });
    setBlogViewMode('editor');
    setEditorTab('editor');
  };

  const handleOpenEditBlog = (b) => {
    setEditingBlogId(b._id);
    setBlogImageFile(null);
    setBlogImagePreview('');
    setBlogForm({
      title: b.title || '',
      slug: b.slug || '',
      category: b.category || 'Spine & Joint Care',
      author: b.author || 'Dr. Satya Prakash & Team',
      readTime: b.readTime || '5 min read',
      image: b.image || '',
      excerpt: b.excerpt || '',
      content: b.content || '',
      status: b.published ? 'Published' : 'Draft',
      tags: b.tags || ['#SpineHealth', '#Physiotherapy'],
      metaTitle: b.metaTitle || b.title || '',
      metaDesc: b.metaDesc || b.excerpt || '',
      focusKeywords: b.focusKeywords || b.category || ''
    });
    setBlogViewMode('editor');
    setEditorTab('editor');
  };

  const handleTitleChange = (val) => {
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setBlogForm(prev => ({
      ...prev,
      title: val,
      slug: editingBlogId ? prev.slug : generatedSlug
    }));
  };

  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    if (!tagInput.trim()) return;
    const newTag = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
    if (!blogForm.tags.includes(newTag)) {
      setBlogForm(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setBlogForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const insertFormat = (before, after = '') => {
    const textarea = document.getElementById('blog-content-textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = blogForm.content;
    const selectedText = text.substring(start, end) || 'text';
    const replacement = before + selectedText + after;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setBlogForm(prev => ({ ...prev, content: newContent }));
  };

  const handlePublishOrSaveBlog = async (e, overrideStatus = null) => {
    if (e) e.preventDefault();
    const publishStatus = overrideStatus || blogForm.status;
    const isPublished = publishStatus === 'Published';

    let payload;
    if (blogImageFile) {
      payload = new FormData();
      payload.append('image', blogImageFile);
      payload.append('title', blogForm.title || '');
      payload.append('slug', blogForm.slug || blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
      payload.append('category', blogForm.category || 'Orthopedic Care');
      payload.append('author', blogForm.author || 'Dr. Satya Prakash & Team');
      payload.append('readTime', blogForm.readTime || '5 min read');
      payload.append('excerpt', blogForm.excerpt || blogForm.content?.slice(0, 150) || blogForm.title);
      payload.append('content', blogForm.content || blogForm.excerpt || blogForm.title);
      payload.append('published', isPublished);
      payload.append('tags', JSON.stringify(blogForm.tags || []));
    } else {
      payload = {
        title: blogForm.title,
        slug: blogForm.slug || blogForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        category: blogForm.category || 'Orthopedic Care',
        author: blogForm.author || 'Dr. Satya Prakash & Team',
        readTime: blogForm.readTime || '5 min read',
        image: blogForm.image || '',
        excerpt: blogForm.excerpt || blogForm.content?.slice(0, 150) || blogForm.title,
        content: blogForm.content || blogForm.excerpt || blogForm.title,
        published: isPublished,
        tags: blogForm.tags
      };
    }

    try {
      let savedBlog;
      if (editingBlogId) {
        const res = await api.updateAdminBlog(editingBlogId, payload);
        savedBlog = res?.data;
        setStatusMsg({ type: 'success', text: 'Blog article updated successfully!' });
      } else {
        const res = await api.createAdminBlog(payload);
        savedBlog = res?.data;
        setStatusMsg({ type: 'success', text: `Blog article ${isPublished ? 'published' : 'saved as draft'} successfully!` });
      }
      
      setBlogViewMode('list');
      setBlogImageFile(null);
      setBlogImagePreview('');

      // Immediate state update & API refetch to guarantee instant synchronization
      const blogListRes = await api.getAdminBlogs().catch(() => null);
      if (blogListRes && blogListRes.data && blogListRes.data.length > 0) {
        setBlogs(blogListRes.data);
      } else if (savedBlog) {
        setBlogs(prev => [savedBlog, ...prev.filter(b => b._id !== savedBlog._id)]);
      }

      loadAdminData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save blog article' });
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog article?")) return;
    try {
      await api.deleteAdminBlog(id);
      setStatusMsg({ type: 'success', text: 'Blog article deleted successfully!' });
      loadAdminData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete blog article' });
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Are you sure you want to remove this service?")) return;
    try {
      await api.deleteAdminService(id);
      setStatusMsg({ type: 'success', text: 'Service removed successfully!' });
      loadAdminData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete service' });
    }
  };

  const handleTogglePayment = async (id, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    try {
      await api.updateAdminPaymentStatus(id, newStatus);
      setStatusMsg({ type: 'success', text: `Payment status updated to ${newStatus.toUpperCase()}` });
      loadAdminData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update payment' });
    }
  };

  const handleUpdateAptStatus = async (id, status) => {
    try {
      await api.updateAdminAppointmentStatus(id, status);
      setStatusMsg({ type: 'success', text: `Appointment status updated to ${status.toUpperCase()}` });
      loadAdminData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update status' });
    }
  };

  const handleOpenTestimonialModal = (t = null) => {
    if (t) {
      setEditingTestimonialId(t._id);
      setNewTestimonial({
        name: t.patientName || t.name || '',
        role: t.patientRole || t.role || '',
        content: t.quote || t.content || '',
        tag: t.tag || t.outcomeTag || 'Recovery Milestone',
        rating: Number(t.stars || t.rating || 5),
        avatar: t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      });
    } else {
      setEditingTestimonialId(null);
      setNewTestimonial({
        name: '',
        role: 'Patient',
        content: '',
        tag: 'Recovery Milestone',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      });
    }
    setTestimonialModalOpen(true);
  };

  const handleCreateTestimonialSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        patientName: newTestimonial.name,
        patientRole: newTestimonial.role,
        quote: newTestimonial.content,
        stars: Number(newTestimonial.rating),
        tag: newTestimonial.tag,
        avatar: newTestimonial.avatar
      };

      if (editingTestimonialId) {
        await api.updateAdminTestimonial(editingTestimonialId, payload);
        setStatusMsg({ type: 'success', text: 'Testimonial updated successfully!' });
      } else {
        await api.createAdminTestimonial(payload);
        setStatusMsg({ type: 'success', text: 'Testimonial created successfully!' });
      }

      setTestimonialModalOpen(false);
      setEditingTestimonialId(null);
      setNewTestimonial({
        name: '',
        role: 'Patient',
        content: '',
        tag: 'Recovery Milestone',
        rating: 5,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
      });
      loadAdminData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save testimonial' });
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await api.deleteAdminTestimonial(id);
      setStatusMsg({ type: 'success', text: 'Testimonial removed!' });
      loadAdminData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete testimonial' });
    }
  };

  const [newsMediaFile, setNewsMediaFile] = useState(null);
  const [newsMediaPreview, setNewsMediaPreview] = useState('');

  const handleNewsMediaFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewsMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewsMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveNewsMedia = () => {
    setNewsMediaFile(null);
    setNewsMediaPreview('');
    setNewsForm((prev) => ({ ...prev, image: '' }));
  };

  const handleOpenNewsModal = (item = null) => {
    setNewsMediaFile(null);
    setNewsMediaPreview('');
    if (item) {
      setEditingNewsId(item._id);
      setNewsForm({
        title: item.title || '',
        category: item.category || 'Announcement',
        summary: item.summary || '',
        content: item.content || '',
        image: item.image || '',
        important: item.important || false
      });
    } else {
      setEditingNewsId(null);
      setNewsForm({
        title: '',
        category: 'Announcement',
        summary: '',
        content: '',
        image: '',
        important: false
      });
    }
    setNewsModalOpen(true);
  };

  const handleNewsSubmit = async (e) => {
    e.preventDefault();
    try {
      let payload;
      if (newsMediaFile) {
        payload = new FormData();
        payload.append('image', newsMediaFile);
        payload.append('title', newsForm.title || '');
        payload.append('category', newsForm.category || 'Announcement');
        payload.append('summary', newsForm.summary || '');
        payload.append('content', newsForm.content || '');
        payload.append('important', newsForm.important);
      } else {
        payload = {
          title: newsForm.title,
          category: newsForm.category || 'Announcement',
          summary: newsForm.summary || '',
          content: newsForm.content || '',
          image: newsForm.image || '',
          important: newsForm.important
        };
      }

      if (editingNewsId) {
        await api.updateAdminNews(editingNewsId, payload);
        setStatusMsg({ type: 'success', text: 'News update saved successfully!' });
      } else {
        await api.createAdminNews(payload);
        setStatusMsg({ type: 'success', text: 'News update published successfully!' });
      }

      setNewsModalOpen(false);
      setEditingNewsId(null);
      setNewsMediaFile(null);
      setNewsMediaPreview('');
      setNewsForm({
        title: '',
        category: 'Announcement',
        summary: '',
        content: '',
        image: '',
        important: false
      });
      loadAdminData(false);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save news update' });
    }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news update?")) return;
    try {
      await api.deleteAdminNews(id);
      setStatusMsg({ type: 'success', text: 'News item deleted successfully!' });
      loadAdminData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete news item' });
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateSystemSettings(settings);
      setStatusMsg({ type: 'success', text: 'System Settings updated successfully!' });
      loadAdminData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update settings' });
    }
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = String(name).trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return String(name).slice(0, 2).toUpperCase();
  };

  const [pageApts, setPageApts] = useState(1);
  const [pageDocs, setPageDocs] = useState(1);
  const [pageUsers, setPageUsers] = useState(1);
  const [pageServices, setPageServices] = useState(1);
  const [pageConsultations, setPageConsultations] = useState(1);
  const [pageTestimonials, setPageTestimonials] = useState(1);
  const [pageBlogs, setPageBlogs] = useState(1);
  const [pageNews, setPageNews] = useState(1);
  const [pageInquiries, setPageInquiries] = useState(1);
  const [pageNotifications, setPageNotifications] = useState(1);

  useEffect(() => {
    setPageApts(1);
  }, [searchTerm]);

  const filteredAppointments = (appointments || []).filter(a =>
    (a?.patientName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (a?.phone || '').includes(searchTerm || '') ||
    (a?.service || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const totalAptPages = Math.ceil(filteredAppointments.length / 10);
  const paginatedAppointments = filteredAppointments.slice((pageApts - 1) * 10, pageApts * 10);

  const totalDocPages = Math.ceil(doctors.length / 10);
  const paginatedDoctors = doctors.slice((pageDocs - 1) * 10, pageDocs * 10);

  const nonAdminUsers = (usersList || []).filter(usr => usr.role !== 'admin');
  const totalUserPages = Math.ceil(nonAdminUsers.length / 10);
  const paginatedUsers = nonAdminUsers.slice((pageUsers - 1) * 10, pageUsers * 10);

  const totalServicePages = Math.ceil(services.length / 10);
  const paginatedServices = services.slice((pageServices - 1) * 10, pageServices * 10);

  const totalConsultationPages = Math.ceil(onlineConsultations.length / 10);
  const paginatedConsultations = onlineConsultations.slice((pageConsultations - 1) * 10, pageConsultations * 10);

  const totalTestimonialPages = Math.ceil(testimonials.length / 10);
  const paginatedTestimonials = testimonials.slice((pageTestimonials - 1) * 10, pageTestimonials * 10);

  const totalBlogPages = Math.ceil(blogs.length / 10);
  const paginatedBlogs = blogs.slice((pageBlogs - 1) * 10, pageBlogs * 10);

  const totalNewsPages = Math.ceil(newsList.length / 10);
  const paginatedNews = newsList.slice((pageNews - 1) * 10, pageNews * 10);

  const totalInquiryPages = Math.ceil(inquiries.length / 10);
  const paginatedInquiries = inquiries.slice((pageInquiries - 1) * 10, pageInquiries * 10);

  const totalNotifPages = Math.ceil(notifications.length / 10);
  const paginatedNotifications = notifications.slice((pageNotifications - 1) * 10, pageNotifications * 10);

  const unreadAppointmentsCount = (appointments || []).filter(a => a.status === 'PENDING_ADMIN_APPROVAL' && !a.isReadAdmin).length;
  const unreadBlogsCount = (blogs || []).filter(b => !b.isReadAdmin).length;
  const unreadNewsCount = (newsList || []).filter(n => !n.isReadAdmin).length;
  const unreadInquiriesCount = (inquiries || []).filter(i => !i.isReadAdmin).length;

  const handleTabSelect = (tab) => {
    setActiveTab(tab);

    if (tab === 'appointments') {
      if (unreadAppointmentsCount > 0) {
        setAppointments(prev => prev.map(a => ({ ...a, isReadAdmin: true })));
        api.markAdminAppointmentsRead().catch(err => console.error(err));
      }
    } else if (tab === 'blogs') {
      if (unreadBlogsCount > 0) {
        setBlogs(prev => prev.map(b => ({ ...b, isReadAdmin: true })));
        api.markAdminBlogsRead().catch(err => console.error(err));
      }
    } else if (tab === 'news') {
      if (unreadNewsCount > 0) {
        setNewsList(prev => prev.map(n => ({ ...n, isReadAdmin: true })));
        api.markAdminNewsRead().catch(err => console.error(err));
      }
    } else if (tab === 'inquiries') {
      if (unreadInquiriesCount > 0) {
        setInquiries(prev => prev.map(i => ({ ...i, isReadAdmin: true })));
        api.markAdminInquiriesRead().catch(err => console.error(err));
      }
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7fb', color: '#0f172a', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={36} className="spin-icon" style={{ color: '#0284c7', marginBottom: '1rem', animation: 'spin 1s linear infinite' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Loading Admin Control Center...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard-root">
      <main className="patient-main-page">
        <div className="patient-dashboard-container">
          <div className="patient-portal-layout">
            {/* Sidebar Navigation */}
            <aside className={`patient-sidebar ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
              <nav className="sidebar-menu">
                <div className="sidebar-user-card-header">
                  <div className="user-avatar-badge" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                    {getInitials(user?.name || 'Admin Console')}
                  </div>
                  <div className="user-info-text">
                    <h3>{user?.name || 'Administrator'}</h3>
                    <p>{user?.email || 'admin@satyaphyseo.com'}</p>
                    <span className="user-role-tag" style={{ background: '#fef3c7', color: '#b45309' }}>ADMIN CONSOLE</span>
                  </div>
                </div>

                <div className="sidebar-section-title">ADMIN CONTROL CENTER</div>

                <button
                  className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <span className="sidebar-link-icon"><Activity size={18} /></span>
                  <span className="sidebar-link-text">Analytics & Overview</span>
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'appointments' ? 'active' : ''}`}
                  onClick={() => handleTabSelect('appointments')}
                >
                  <span className="sidebar-link-icon"><Calendar size={18} /></span>
                  <span className="sidebar-link-text">All Appointments</span>
                  {unreadAppointmentsCount > 0 && <span className="sidebar-badge">{unreadAppointmentsCount}</span>}
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'doctors' ? 'active' : ''}`}
                  onClick={() => setActiveTab('doctors')}
                >
                  <span className="sidebar-link-icon"><ShieldCheck size={18} /></span>
                  <span className="sidebar-link-text">Physiotherapists</span>
                  {stats.pendingDoctors > 0 && <span className="sidebar-badge badge-unread">{stats.pendingDoctors} Unverified</span>}
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'physio-approvals' ? 'active' : ''}`}
                  onClick={() => setActiveTab('physio-approvals')}
                >
                  <span className="sidebar-link-icon"><Award size={18} /></span>
                  <span className="sidebar-link-text">Physiotherapist Approvals</span>
                  {physioApprovals.filter(p => p.approvalStatus === 'PENDING').length > 0 && (
                    <span className="sidebar-badge badge-unread">
                      {physioApprovals.filter(p => p.approvalStatus === 'PENDING').length} Pending
                    </span>
                  )}
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <span className="sidebar-link-icon"><Users size={18} /></span>
                  <span className="sidebar-link-text">Patients & Users</span>
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'services' ? 'active' : ''}`}
                  onClick={() => setActiveTab('services')}
                >
                  <span className="sidebar-link-icon"><Briefcase size={18} /></span>
                  <span className="sidebar-link-text">Services Offered</span>
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'consultations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('consultations')}
                >
                  <span className="sidebar-link-icon"><Video size={18} /></span>
                  <span className="sidebar-link-text">Online Consultations</span>
                </button>

                <div className="sidebar-section-title" style={{ marginTop: '0.75rem' }}>CONTENT & SYSTEM</div>

                <button
                  className={`sidebar-link ${activeTab === 'testimonials' ? 'active' : ''}`}
                  onClick={() => setActiveTab('testimonials')}
                >
                  <span className="sidebar-link-icon"><Star size={18} /></span>
                  <span className="sidebar-link-text">Testimonials & Reviews</span>
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'blogs' ? 'active' : ''}`}
                  onClick={() => handleTabSelect('blogs')}
                >
                  <span className="sidebar-link-icon"><BookOpen size={18} /></span>
                  <span className="sidebar-link-text">Blog Articles</span>
                  {unreadBlogsCount > 0 && <span className="sidebar-badge">{unreadBlogsCount}</span>}
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'news' ? 'active' : ''}`}
                  onClick={() => handleTabSelect('news')}
                >
                  <span className="sidebar-link-icon"><FileText size={18} /></span>
                  <span className="sidebar-link-text">News & Bulletins</span>
                  {unreadNewsCount > 0 && <span className="sidebar-badge">{unreadNewsCount}</span>}
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'inquiries' ? 'active' : ''}`}
                  onClick={() => handleTabSelect('inquiries')}
                >
                  <span className="sidebar-link-icon"><MessageSquare size={18} /></span>
                  <span className="sidebar-link-text">Contact Inquiries</span>
                  {unreadInquiriesCount > 0 && <span className="sidebar-badge badge-unread">{unreadInquiriesCount}</span>}
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <span className="sidebar-link-icon"><Settings size={18} /></span>
                  <span className="sidebar-link-text">System Settings</span>
                </button>

                <button
                  className={`sidebar-link ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <span className="sidebar-link-icon"><Bell size={18} /></span>
                  <span className="sidebar-link-text">Notifications</span>
                  {unreadNotifsCount > 0 && <span className="sidebar-badge badge-unread">{unreadNotifsCount}</span>}
                </button>

                <Link to="/" className="sidebar-link" style={{ marginTop: '0.25rem' }}>
                  <span className="sidebar-link-icon"><ArrowIcon size={18} /></span>
                  <span className="sidebar-link-text">Main Website</span>
                </Link>

                <button
                  className="sidebar-link sidebar-logout-btn"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  <span className="sidebar-link-icon"><LogOut size={18} /></span>
                  <span className="sidebar-link-text">Sign Out</span>
                </button>
              </nav>
            </aside>

            {/* Main Content Area (RIGHT SIDE) */}
            <div className="patient-content-area">
              {/* Mobile Dashboard Topbar Toggle */}
              <div className="mobile-dashboard-header">
                <div className="mobile-tab-info">
                  <span className="mobile-tab-label">Admin Control</span>
                  <strong className="mobile-tab-name">
                    {activeTab === 'overview' && 'Overview'}
                    {activeTab === 'appointments' && 'All Appointments'}
                    {activeTab === 'doctors' && 'Physiotherapy Team'}
                    {activeTab === 'users' && 'Patient Accounts'}
                    {activeTab === 'services' && 'Clinical Services'}
                    {activeTab === 'consultations' && 'Online Consultations'}
                    {activeTab === 'testimonials' && 'Patient Stories'}
                    {activeTab === 'inquiries' && 'Website Inquiries'}
                    {activeTab === 'news' && 'News & Updates'}
                    {activeTab === 'blogs' && 'Health Articles'}
                    {activeTab === 'settings' && 'System Settings'}
                    {activeTab === 'notifications' && `Notifications ${unreadNotifsCount > 0 ? `(${unreadNotifsCount})` : ''}`}
                  </strong>
                </div>
                <button
                  type="button"
                  className="mobile-sidebar-toggle-btn"
                  onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                >
                  {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                  <span>{mobileSidebarOpen ? 'Close Menu' : 'Admin Menu'}</span>
                </button>
              </div>
              <div className="patient-hero-bar">
                <div className="patient-welcome">
                  <h1>
                    Welcome to <span className="serif-italic-teal">Clinic System Administration</span>
                  </h1>
                  <p>Manage bookings, physiotherapist verifications, services, users, offline payment records, and website content.</p>
                </div>
              </div>

              {statusMsg.text && (
                <div className={`auth-alert ${statusMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} />
                    <span>{statusMsg.text}</span>
                  </div>
                  <button 
                    onClick={() => setStatusMsg({ type: '', text: '' })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                    title="Dismiss"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* TAB 1: OVERVIEW & ANALYTICS */}
              {activeTab === 'overview' && (
                <div>
                  <div className="patient-kpi-grid">
                    <div className="kpi-card">
                      <div className="kpi-icon-wrap kpi-icon-teal">
                        <Users size={24} />
                      </div>
                      <div className="kpi-content">
                        <div className="kpi-label">Registered Patients</div>
                        <div className="kpi-value">{stats.totalPatients}</div>
                        <div className="kpi-sub">Total patient accounts</div>
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-icon-wrap kpi-icon-navy">
                        <ShieldCheck size={24} />
                      </div>
                      <div className="kpi-content">
                        <div className="kpi-label">Active Specialists</div>
                        <div className="kpi-value">{stats.totalDoctors}</div>
                        <div className="kpi-sub">{stats.pendingDoctors} pending verification</div>
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-icon-wrap kpi-icon-orange">
                        <Calendar size={24} />
                      </div>
                      <div className="kpi-content">
                        <div className="kpi-label">Total Bookings</div>
                        <div className="kpi-value">{stats.totalAppointments}</div>
                        <div className="kpi-sub">{stats.completedAppointments} completed</div>
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-icon-wrap kpi-icon-purple">
                        <DollarSign size={24} />
                      </div>
                      <div className="kpi-content">
                        <div className="kpi-label">Est. Revenue Recorded</div>
                        <div className="kpi-value">{stats.totalEstRevenue}</div>
                        <div className="kpi-sub">Paid consultations</div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-panel" style={{ marginTop: '1.5rem' }}>
                    <div className="admin-panel-header">
                      <h2 className="admin-panel-title">Recent Appointment Activity</h2>
                      <button className="btn btn-outline-dark doc-btn-sm" onClick={() => handleTabSelect('appointments')}>
                        View All Bookings
                      </button>
                    </div>

                    {appointments.length > 0 ? (
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Patient Name</th>
                              <th>Service & Specialist</th>
                              <th>Date & Slot</th>
                              <th>Status</th>
                              <th>Payment Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {appointments.slice(0, 5).map((apt) => (
                              <tr key={apt._id}>
                                <td>
                                  <strong>{apt.patientName}</strong>
                                  <div className="table-sub-text">{apt.phone}</div>
                                </td>
                                <td>
                                  <strong>{apt.service}</strong>
                                  <div className="table-sub-text">{apt.specialist}</div>
                                </td>
                                <td>{apt.date} at {apt.timeSlot}</td>
                                <td><span className={`status-badge status-${apt.status || 'upcoming'}`}>{(apt?.status || 'upcoming').toUpperCase()}</span></td>
                                <td>
                                  <span className={`status-badge ${apt.paymentStatus === 'paid' ? 'status-completed' : 'status-cancelled'}`}>
                                    {apt.paymentStatus === 'paid' ? 'Paid' : 'Pending (Offline)'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="empty-state-block">
                        <div className="empty-state-icon-wrap">
                          <Calendar size={32} />
                        </div>
                        <h3>No Bookings Yet</h3>
                        <p>No appointment records found in system database.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: APPOINTMENTS & BOOKINGS */}
              {activeTab === 'appointments' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">All Clinic & Home Appointment Bookings</h2>
                      <p className="admin-subtitle">Update status, mark completion, or toggle offline payment status.</p>
                    </div>
                    <div style={{ position: 'relative', width: '240px' }}>
                      <input
                        type="text"
                        placeholder="Search patient, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                      <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    </div>
                  </div>

                  {filteredAppointments.length > 0 ? (
                    <>
                      <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Patient Basic Details</th>
                            <th>Service & Specialist</th>
                            <th>Date & Time</th>
                            <th>Venue / Address</th>
                            <th>Status & Payment</th>
                            <th>Admin Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedAppointments.map((apt) => (
                            <tr key={apt._id}>
                              <td>
                                <strong>{apt.patientName}</strong>
                                <div className="table-sub-text">{apt.phone}</div>
                                {apt.email && <div className="table-sub-text">{apt.email}</div>}
                              </td>
                              <td>
                                <div>
                                  {apt.appointmentType === 'home' ? (
                                    <span className="status-badge status-home" style={{ display: 'inline-block', marginBottom: '0.2rem' }}>Home Visit</span>
                                  ) : (
                                    <span className="status-badge status-upcoming" style={{ display: 'inline-block', marginBottom: '0.2rem' }}>Clinic Visit</span>
                                  )}
                                </div>
                                <strong>{apt.service}</strong>
                                <div className="table-sub-text">Specialist: {apt.specialist}</div>
                              </td>
                              <td>
                                <div><strong>{apt.date}</strong></div>
                                <div className="table-sub-text">{apt.timeSlot}</div>
                              </td>
                              <td>
                                {apt.appointmentType === 'home' ? (
                                  <div>
                                    <strong>{apt.homeAddress}</strong>
                                    <div className="table-sub-text">{apt.cityArea}</div>
                                  </div>
                                ) : (
                                  <div className="table-sub-text">Satya Clinic Desk</div>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                  {apt.status === 'PENDING_ADMIN_APPROVAL' && (
                                    <span className="status-badge" style={{ background: '#fef3c7', color: '#b45309' }}>Pending Admin</span>
                                  )}
                                  {apt.status === 'PENDING_PHYSIOTHERAPIST_APPROVAL' && (
                                    <span className="status-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>Pending Specialist</span>
                                  )}
                                  {(apt.status === 'CONFIRMED' || apt.status === 'upcoming') && (
                                    <span className="status-badge status-upcoming">Confirmed</span>
                                  )}
                                  {apt.status === 'REJECTED_BY_ADMIN' && (
                                    <span className="status-badge status-cancelled">Admin Rejected</span>
                                  )}
                                  {apt.status === 'REJECTED_BY_PHYSIOTHERAPIST' && (
                                    <span className="status-badge status-cancelled">Physio Rejected</span>
                                  )}
                                  {apt.status === 'completed' && (
                                    <span className="status-badge status-completed">Completed</span>
                                  )}
                                  {apt.status === 'cancelled' && (
                                    <span className="status-badge status-cancelled">Cancelled</span>
                                  )}
                                  <button
                                    className={`status-badge ${apt.paymentStatus === 'paid' ? 'status-completed' : 'status-cancelled'}`}
                                    onClick={() => handleTogglePayment(apt._id, apt.paymentStatus)}
                                    style={{ cursor: 'pointer', border: 'none' }}
                                    title="Click to toggle offline payment"
                                  >
                                    <DollarSign size={12} /> {apt.paymentStatus === 'paid' ? 'Paid' : 'Pending (Offline)'}
                                  </button>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                  {apt.status === 'PENDING_ADMIN_APPROVAL' && (
                                    <>
                                      <button className="btn btn-teal doc-btn-sm" onClick={() => handleApproveByAdmin(apt._id)}>
                                        Approve
                                      </button>
                                      <button className="action-btn-danger-text" onClick={() => handleRejectByAdmin(apt._id)}>
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {apt.status === 'PENDING_PHYSIOTHERAPIST_APPROVAL' && (
                                    <span className="table-sub-text" style={{ color: '#0369a1', fontWeight: 'bold' }}>Sent to Physio</span>
                                  )}
                                  {apt.status === 'REJECTED_BY_ADMIN' && (
                                    <span className="table-sub-text" style={{ color: '#dc2626' }}>Rejected by Admin</span>
                                  )}
                                  {apt.status === 'REJECTED_BY_PHYSIOTHERAPIST' && (
                                    <span className="table-sub-text" style={{ color: '#dc2626' }}>Rejected by Physio</span>
                                  )}
                                  {(apt.status === 'CONFIRMED' || apt.status === 'upcoming') && (
                                    <>
                                      <button className="btn btn-teal doc-btn-sm" onClick={() => handleUpdateAptStatus(apt._id, 'completed')}>
                                        Complete
                                      </button>
                                      <button className="action-btn-danger-text" onClick={() => handleUpdateAptStatus(apt._id, 'cancelled')}>
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                  {apt.status === 'completed' && <span className="table-sub-text" style={{ color: '#00b493', fontWeight: 'bold' }}>✓ Finished</span>}
                                  {apt.status === 'cancelled' && <span className="table-sub-text" style={{ color: '#ef4444' }}>Cancelled</span>}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                      <Pagination currentPage={pageApts} totalPages={totalAptPages} onPageChange={setPageApts} totalItems={filteredAppointments.length} itemsPerPage={10} />
                    </>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <Search size={32} />
                      </div>
                      <h3>No Appointments Found</h3>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PHYSIOTHERAPISTS & VERIFICATION */}
              {activeTab === 'doctors' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">Physiotherapist Verification & Management</h2>
                      <p className="admin-subtitle">Verify doctor credentials, approve accounts, or add new specialists.</p>
                    </div>
                    <button className="btn btn-teal doc-btn-sm" onClick={() => setDoctorModalOpen(true)}>
                      <Plus size={16} /> Onboard New Specialist
                    </button>
                  </div>

                  {doctors.length > 0 ? (
                    <>
                      <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Specialist Name</th>
                            <th>Qualification & Experience</th>
                            <th>Specialization</th>
                            <th>Consultation Fee</th>
                            <th>Verification Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedDoctors.map((doc) => (
                            <tr key={doc._id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                  <button
                                    type="button"
                                    className="btn-icon-view"
                                    title="View Specialist Details"
                                    onClick={() => setViewDoctorModal(doc)}
                                    style={{
                                      background: '#f1f5f9',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '6px',
                                      padding: '5px 7px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#0d9488',
                                      transition: 'all 0.2s ease',
                                      flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#0d9488';
                                      e.currentTarget.style.color = '#ffffff';
                                      e.currentTarget.style.borderColor = '#0d9488';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#f1f5f9';
                                      e.currentTarget.style.color = '#0d9488';
                                      e.currentTarget.style.borderColor = '#cbd5e1';
                                    }}
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <div>
                                    <strong
                                      style={{ cursor: 'pointer', color: '#0f172a' }}
                                      onClick={() => setViewDoctorModal(doc)}
                                    >
                                      {doc.name}
                                    </strong>
                                    <div className="table-sub-text">{doc.title}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div><strong>{doc.qualification}</strong></div>
                                <div className="table-sub-text">{doc.experienceYears} Years Exp.</div>
                              </td>
                              <td>{doc.specialization}</td>
                              <td><strong>{doc.consultationFee}</strong></td>
                              <td>
                                <span className={`status-badge ${doc.active ? 'status-completed' : 'status-cancelled'}`}>
                                  {doc.active ? 'VERIFIED & ACTIVE' : 'UNVERIFIED / SUSPENDED'}
                                </span>
                              </td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <button
                                    type="button"
                                    className="btn btn-outline-dark doc-btn-sm"
                                    title="View Specialist Details"
                                    onClick={() => setViewDoctorModal(doc)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                                  >
                                    <Eye size={14} /> View
                                  </button>
                                  <button
                                    className={`btn ${doc.active ? 'btn-outline-dark' : 'btn-teal'} doc-btn-sm`}
                                    onClick={() => handleVerifyDoctor(doc._id)}
                                  >
                                    {doc.active ? 'Suspend Account' : 'Verify & Approve'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                      <Pagination currentPage={pageDocs} totalPages={totalDocPages} onPageChange={setPageDocs} totalItems={doctors.length} itemsPerPage={10} />
                    </>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <ShieldCheck size={32} />
                      </div>
                      <h3>No Doctors Registered</h3>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: PHYSIOTHERAPIST APPROVALS */}
              {activeTab === 'physio-approvals' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">Physiotherapist Approvals & Verification</h2>
                      <p className="admin-subtitle">Review professional registration applications, check council credentials, approve accounts, or reject with reason.</p>
                    </div>

                    <div style={{ position: 'relative', width: '260px' }}>
                      <input
                        type="text"
                        placeholder="Search physio, email, city, reg no..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem 0.75rem 0.5rem 2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      />
                      <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    </div>
                  </div>

                  {/* Filter Sub-Tabs */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                    <button
                      className={`btn ${physioFilterStatus === 'PENDING' ? 'btn-teal' : 'btn-outline-dark'}`}
                      onClick={() => setPhysioFilterStatus('PENDING')}
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                    >
                      Pending Review ({physioApprovals.filter(p => p.approvalStatus === 'PENDING').length})
                    </button>
                    <button
                      className={`btn ${physioFilterStatus === 'APPROVED' ? 'btn-teal' : 'btn-outline-dark'}`}
                      onClick={() => setPhysioFilterStatus('APPROVED')}
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                    >
                      Approved ({physioApprovals.filter(p => p.approvalStatus === 'APPROVED').length})
                    </button>
                    <button
                      className={`btn ${physioFilterStatus === 'REJECTED' ? 'btn-teal' : 'btn-outline-dark'}`}
                      onClick={() => setPhysioFilterStatus('REJECTED')}
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                    >
                      Rejected ({physioApprovals.filter(p => p.approvalStatus === 'REJECTED').length})
                    </button>
                    <button
                      className={`btn ${physioFilterStatus === 'ALL' ? 'btn-teal' : 'btn-outline-dark'}`}
                      onClick={() => setPhysioFilterStatus('ALL')}
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                    >
                      All ({physioApprovals.length})
                    </button>
                  </div>

                  {(() => {
                    const filteredPhysios = physioApprovals.filter(p => {
                      const matchesStatus = physioFilterStatus === 'ALL' || p.approvalStatus === physioFilterStatus;
                      const matchesSearch = !searchTerm || (
                        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.phone || '').includes(searchTerm) ||
                        (p.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
                      );
                      return matchesStatus && matchesSearch;
                    });

                    if (filteredPhysios.length === 0) {
                      return (
                        <div className="empty-state-block">
                          <div className="empty-state-icon-wrap">
                            <Award size={32} />
                          </div>
                          <h3>No Physiotherapist Registrations Found</h3>
                          <p>There are no practitioner registrations matching status "{physioFilterStatus}".</p>
                        </div>
                      );
                    }

                    return (
                      <div className="table-responsive">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Physiotherapist</th>
                              <th>Qualification & Specialization</th>
                              <th>Reg. Number & Council</th>
                              <th>Practice & City</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPhysios.map((p) => (
                              <tr key={p._id}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <img
                                      src={p.profilePhoto || p.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                      alt={p.name}
                                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                                    />
                                    <div>
                                      <strong>{p.name}</strong>
                                      <div className="table-sub-text"><Mail size={12} /> {p.email}</div>
                                      <div className="table-sub-text"><Phone size={12} /> {p.phone}</div>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div><strong>{p.qualification || 'BPT / MPT'}</strong></div>
                                  <div style={{ fontSize: '0.85rem', color: '#0f766e', fontWeight: '500' }}>{p.specialization || 'Physiotherapy'}</div>
                                  <div className="table-sub-text">{p.experience ? `${p.experience} Years Exp.` : 'Experience N/A'}</div>
                                </td>
                                <td>
                                  <div><strong>{p.registrationNumber || 'Pending'}</strong></div>
                                  <div className="table-sub-text">{p.registrationAuthority || 'Council N/A'}</div>
                                </td>
                                <td>
                                  <div><strong>{p.clinicName || 'Independent Practice'}</strong></div>
                                  <div className="table-sub-text">{p.city ? `${p.city}` : ''} ({p.consultationType || 'Both'})</div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                    {p.approvalStatus === 'PENDING' && (
                                      <span className="status-badge" style={{ background: '#fef3c7', color: '#b45309' }}>Pending Review</span>
                                    )}
                                    {p.approvalStatus === 'APPROVED' && (
                                      <span className="status-badge status-completed">Approved</span>
                                    )}
                                    {p.approvalStatus === 'REJECTED' && (
                                      <span className="status-badge status-cancelled">Rejected</span>
                                    )}
                                    <span className="table-sub-text" style={{ fontSize: '0.75rem' }}>
                                      Reg: {p.registrationStatus || 'INCOMPLETE'}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      className="btn btn-outline-dark doc-btn-sm"
                                      onClick={() => setViewPhysioModal(p)}
                                    >
                                      <Eye size={14} /> View Details
                                    </button>

                                    {p.approvalStatus !== 'APPROVED' && (
                                      <button
                                        type="button"
                                        className="btn btn-teal doc-btn-sm"
                                        onClick={() => handleApprovePhysio(p._id)}
                                      >
                                        Approve
                                      </button>
                                    )}

                                    {p.approvalStatus !== 'REJECTED' && (
                                      <button
                                        type="button"
                                        className="action-btn-danger-text"
                                        onClick={() => setRejectPhysioModal({ isOpen: true, physioId: p._id, physioName: p.name, reason: '' })}
                                      >
                                        Reject
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 4: PATIENTS & USERS */}
              {activeTab === 'users' && (
                <div className="admin-panel">
                  {selectedUserDetail ? (
                    /* --- FULL PAGE USER DETAIL VIEW --- */
                    <div className="user-detail-full-page">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                        <button
                          type="button"
                          className="btn btn-outline-dark doc-btn-sm"
                          onClick={() => setSelectedUserDetail(null)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <ArrowLeft size={16} />
                          <span>Back to Patients & Users List</span>
                        </button>

                        <span className="status-badge status-upcoming" style={{ fontSize: '0.85rem' }}>
                          {(selectedUserDetail.role || 'patient').toUpperCase()} ACCOUNT
                        </span>
                      </div>

                      {/* Header Showcase */}
                      <div className="admin-card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #0b1329 0%, #0f172a 100%)', color: '#ffffff', borderRadius: '18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                          <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: 'rgba(0, 180, 147, 0.15)', color: '#00b493', border: '2px solid rgba(0, 180, 147, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.85rem', fontWeight: 800 }}>
                            {(selectedUserDetail.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                                {selectedUserDetail.name || 'User Profile'}
                              </h1>
                              <span style={{ background: '#00b493', color: '#04101e', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase' }}>
                                {selectedUserDetail.role || 'patient'}
                              </span>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.35rem 0 0 0' }}>
                              Registered Patient & User Account Details
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Metadata Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                        <div className="admin-card" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px' }}>
                          <span style={{ fontSize: '0.725rem', fontWeight: 800, letterSpacing: '0.08em', color: '#00b493', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>Full Name</span>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{selectedUserDetail.name || 'N/A'}</h3>
                        </div>

                        <div className="admin-card" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px' }}>
                          <span style={{ fontSize: '0.725rem', fontWeight: 800, letterSpacing: '0.08em', color: '#00b493', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>Email Address</span>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0, wordBreak: 'break-all' }}>{selectedUserDetail.email || 'N/A'}</h3>
                        </div>

                        <div className="admin-card" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px' }}>
                          <span style={{ fontSize: '0.725rem', fontWeight: 800, letterSpacing: '0.08em', color: '#00b493', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>Contact Phone</span>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{selectedUserDetail.phone || 'N/A'}</h3>
                        </div>

                        <div className="admin-card" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px' }}>
                          <span style={{ fontSize: '0.725rem', fontWeight: 800, letterSpacing: '0.08em', color: '#00b493', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>Account Role</span>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'capitalize' }}>{selectedUserDetail.role || 'Patient'}</h3>
                        </div>
                      </div>

                      {/* Residential Address Block */}
                      <div className="admin-card" style={{ padding: '1.5rem 1.75rem', borderRadius: '16px', marginBottom: '1.75rem' }}>
                        <span style={{ fontSize: '0.725rem', fontWeight: 800, letterSpacing: '0.08em', color: '#00b493', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>Residential Address</span>
                        <p style={{ fontSize: '0.975rem', color: '#334155', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                          {selectedUserDetail.address || 'No residential address registered'}
                        </p>
                      </div>

                      {/* System Metadata */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                        <div className="admin-card" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px' }}>
                          <span style={{ fontSize: '0.725rem', fontWeight: 800, letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>Account ID</span>
                          <code style={{ fontSize: '0.85rem', color: '#0f172a', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                            {selectedUserDetail._id}
                          </code>
                        </div>

                        <div className="admin-card" style={{ padding: '1.25rem 1.5rem', borderRadius: '16px' }}>
                          <span style={{ fontSize: '0.725rem', fontWeight: 800, letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>Joined Date</span>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                            {selectedUserDetail.createdAt ? new Date(selectedUserDetail.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Active User Account'}
                          </h3>
                        </div>
                      </div>

                      {/* Associated Appointments for User */}
                      {(() => {
                        const userAppointments = appointments.filter(a => a.userId === selectedUserDetail._id || (a.patientName && a.patientName.toLowerCase() === selectedUserDetail.name?.toLowerCase()));
                        return (
                          <div className="admin-card" style={{ padding: '1.5rem 1.75rem', borderRadius: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                              Associated Appointment History ({userAppointments.length})
                            </h3>
                            {userAppointments.length > 0 ? (
                              <div className="table-responsive">
                                <table className="admin-table">
                                  <thead>
                                    <tr>
                                      <th>Date & Time</th>
                                      <th>Doctor / Service</th>
                                      <th>Status</th>
                                      <th>Payment</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {userAppointments.map((app) => (
                                      <tr key={app._id}>
                                        <td><strong>{app.date || app.appointmentDate}</strong> ({app.timeSlot})</td>
                                        <td>{app.doctorName || app.serviceName || 'General Consultation'}</td>
                                        <td><span className="status-badge status-upcoming">{(app.status || 'Scheduled').toUpperCase()}</span></td>
                                        <td><strong style={{ color: '#00b493' }}>{app.paymentStatus || 'Paid'}</strong></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>No active appointment records linked to this account.</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <>
                      <div className="admin-panel-header">
                        <div>
                          <h2 className="admin-panel-title">Registered Patients & Users</h2>
                          <p className="admin-subtitle">View registered patient and staff accounts.</p>
                        </div>
                      </div>

                      {nonAdminUsers.length > 0 ? (
                        <>
                          <div className="table-responsive">
                            <table className="admin-table">
                              <thead>
                                <tr>
                                  <th>User Name</th>
                                  <th>Email Address</th>
                                  <th>Contact Phone</th>
                                  <th>Address</th>
                                  <th>Current Role</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedUsers.map((usr) => (
                                  <tr key={usr._id}>
                                    <td><strong>{usr.name}</strong></td>
                                    <td>{usr.email}</td>
                                    <td>{usr.phone}</td>
                                    <td>{usr.address || 'N/A'}</td>
                                    <td>
                                      <span className="status-badge status-upcoming">{(usr?.role || 'patient').toUpperCase()}</span>
                                    </td>
                                    <td>
                                      <button
                                        type="button"
                                        className="btn btn-outline-dark btn-sm"
                                        onClick={() => setSelectedUserDetail(usr)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
                                      >
                                        <Eye size={14} />
                                        <span>View Details</span>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <Pagination currentPage={pageUsers} totalPages={totalUserPages} onPageChange={setPageUsers} totalItems={nonAdminUsers.length} itemsPerPage={10} />
                        </>
                      ) : (
                        <div className="empty-state-block">
                          <div className="empty-state-icon-wrap">
                            <Users size={32} />
                          </div>
                          <h3>No Registered Users</h3>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB 5: SERVICES OFFERED */}
              {activeTab === 'services' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">Manage Clinic Treatment Services</h2>
                      <p className="admin-subtitle">Create, update, or toggle services displayed on the website.</p>
                    </div>
                    <button className="btn btn-teal doc-btn-sm" onClick={handleOpenAddService}>
                      <Plus size={16} /> Add New Service
                    </button>
                  </div>

                  {services.length > 0 ? (
                    <>
                      <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Service Title</th>
                            <th>Duration</th>
                            <th>Price</th>
                            <th>Description</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedServices.map((srv) => (
                            <tr key={srv._id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  {srv.image ? (
                                    <img
                                      src={srv.image}
                                      alt={srv.title}
                                      style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                    />
                                  ) : (
                                    <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <ImageIcon size={18} style={{ color: '#94a3b8' }} />
                                    </div>
                                  )}
                                  <div>
                                    <strong>{srv.title}</strong>
                                    {srv.category && <div className="table-sub-text" style={{ fontSize: '0.75rem', color: '#64748b' }}>{srv.category}</div>}
                                  </div>
                                </div>
                              </td>
                              <td>{srv.duration || '45 mins'}</td>
                              <td><strong>{srv.price || '₹1,200'}</strong></td>
                              <td style={{ maxWidth: '300px' }}><p className="table-sub-text">{srv.desc || srv.description}</p></td>
                              <td style={{ whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <button
                                    className="btn-icon"
                                    title="Edit Service"
                                    onClick={() => handleOpenEditService(srv)}
                                    style={{ padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', background: 'rgba(0,180,147,0.1)', color: '#00b493', border: '1px solid rgba(0,180,147,0.3)', borderRadius: '6px', cursor: 'pointer' }}
                                  >
                                    <Edit3 size={15} /> Edit
                                  </button>
                                  <button className="action-btn-danger-text" onClick={() => handleDeleteService(srv._id)}>
                                    <Trash2 size={16} /> Remove
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                      <Pagination currentPage={pageServices} totalPages={totalServicePages} onPageChange={setPageServices} totalItems={services.length} itemsPerPage={10} />
                    </>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <Briefcase size={32} />
                      </div>
                      <h3>No Services Added</h3>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: ONLINE CONSULTATIONS */}
              {activeTab === 'consultations' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">Online Consultation & Report Submissions</h2>
                      <p className="admin-subtitle">Patient submitted medical reports for review.</p>
                    </div>
                  </div>

                  {onlineConsultations.length > 0 ? (
                    <>
                      <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Patient Name & Phone</th>
                            <th>Condition Symptoms</th>
                            <th>Preferred Date & Time</th>
                            <th>Report File</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedConsultations.map((req) => (
                            <tr key={req._id}>
                              <td>
                                <strong>{req.name}</strong>
                                <div className="table-sub-text">{req.phone}</div>
                              </td>
                              <td>{req.condition}</td>
                              <td>{req.preferredDate} ({req.preferredTime})</td>
                              <td>
                                {req.reportFile ? (
                                  <a
                                    href={req.reportFile.startsWith('http') ? req.reportFile : `http://localhost:5000${req.reportFile}`}
                                    className="report-link"
                                  >
                                    <Eye size={14} /> View Report
                                  </a>
                                ) : (
                                  <span className="table-sub-text">No File</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                      <Pagination currentPage={pageConsultations} totalPages={totalConsultationPages} onPageChange={setPageConsultations} totalItems={onlineConsultations.length} itemsPerPage={10} />
                    </>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <Video size={32} />
                      </div>
                      <h3>No Consultation Submissions</h3>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: TESTIMONIALS & REVIEWS */}
              {activeTab === 'testimonials' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">Website Patient Testimonials & Reviews</h2>
                      <p className="admin-subtitle">Manage patient stories and reviews shown on the homepage.</p>
                    </div>
                    <button className="btn btn-teal doc-btn-sm" onClick={() => handleOpenTestimonialModal(null)}>
                      <Plus size={16} /> Add Testimonial
                    </button>
                  </div>

                  {testimonials.length > 0 ? (
                    <>
                      <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Condition / Role</th>
                            <th>Outcome Tag</th>
                            <th>Testimonial Quote</th>
                            <th>Rating</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedTestimonials.map((t) => (
                            <tr key={t._id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                  <img
                                    src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                    alt={t.patientName || t.name}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #0d9488' }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                                    }}
                                  />
                                  <strong>{t.patientName || t.name}</strong>
                                </div>
                              </td>
                              <td>{t.patientRole || t.role || 'Patient'}</td>
                              <td>
                                <span style={{
                                  background: '#ccfbf1',
                                  color: '#0f766e',
                                  padding: '3px 10px',
                                  borderRadius: '16px',
                                  fontSize: '0.78rem',
                                  fontWeight: '600',
                                  display: 'inline-block'
                                }}>
                                  {t.tag || t.outcomeTag || 'Recovery Milestone'}
                                </span>
                              </td>
                              <td style={{ maxWidth: '320px' }}>
                                <p className="table-sub-text" style={{ fontStyle: 'italic', margin: 0, color: '#334155' }}>
                                  "{t.quote || t.content}"
                                </p>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.15rem', color: '#f59e0b' }}>
                                  {[...Array(Number(t.stars || t.rating || 5))].map((_, i) => (
                                    <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                                  ))}
                                </div>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                  <button
                                    type="button"
                                    className="btn btn-outline-dark doc-btn-sm"
                                    onClick={() => handleOpenTestimonialModal(t)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                  >
                                    <Edit3 size={14} /> Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="action-btn-danger-text"
                                    onClick={() => handleDeleteTestimonial(t._id)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                                  >
                                    <Trash2 size={14} /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                      <Pagination currentPage={pageTestimonials} totalPages={totalTestimonialPages} onPageChange={setPageTestimonials} totalItems={testimonials.length} itemsPerPage={10} />
                    </>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <Star size={32} />
                      </div>
                      <h3>No Testimonials Available</h3>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: BLOG ARTICLES & MANAGEMENT */}
              {activeTab === 'blogs' && (
                <div>
                  {blogViewMode === 'list' ? (
                    <div className="admin-panel">
                      <div className="admin-panel-header">
                        <div>
                          <h2 className="admin-panel-title">Clinical Blog Articles & Patient Guides</h2>
                          <p className="admin-subtitle">Publish new clinical articles, patient education guides, and evidence-based blogs.</p>
                        </div>
                        <button className="btn btn-teal doc-btn-sm" onClick={handleOpenCreateBlog}>
                          <Plus size={16} /> Publish New Article
                        </button>
                      </div>

                      {blogs.length > 0 ? (
                        <>
                          <div className="table-responsive">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Featured Image & Article</th>
                                <th>Author & Date</th>
                                <th>Read Time</th>
                                <th>Status</th>
                                <th>Excerpt</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedBlogs.map((b) => (
                                <tr key={b._id}>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                      {b.image && (
                                        <img 
                                          src={b.image} 
                                          alt={b.title} 
                                          style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} 
                                        />
                                      )}
                                      <div>
                                        <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>{b.title}</strong>
                                        <span className="status-badge status-upcoming" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                                          {b.category}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div><strong>{b.author}</strong></div>
                                    <div className="table-sub-text">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Published'}</div>
                                  </td>
                                  <td>{b.readTime || '5 min read'}</td>
                                  <td>
                                    <span className={`status-badge ${b.published ? 'status-completed' : 'status-cancelled'}`}>
                                      {b.published ? 'Published' : 'Draft'}
                                    </span>
                                  </td>
                                  <td style={{ maxWidth: '260px' }}>
                                    <p className="table-sub-text" style={{ margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                      {b.excerpt || (b.content ? b.content.slice(0, 90) + '...' : b.title)}
                                    </p>
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                      <button
                                        className="btn btn-outline-dark doc-btn-sm"
                                        onClick={() => handleOpenEditBlog(b)}
                                        title="Edit Article"
                                      >
                                        <Edit3 size={14} /> Edit
                                      </button>
                                      <button
                                        className="action-btn-danger-text"
                                        onClick={() => handleDeleteBlog(b._id)}
                                        title="Delete Article"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                          <Pagination currentPage={pageBlogs} totalPages={totalBlogPages} onPageChange={setPageBlogs} totalItems={blogs.length} itemsPerPage={10} />
                        </>
                      ) : (
                        <div className="empty-state-block">
                          <div className="empty-state-icon-wrap">
                            <BookOpen size={32} />
                          </div>
                          <h3>No Blog Articles Found</h3>
                          <p>Start writing evidence-based clinical guides for your clinic patients.</p>
                          <button className="btn btn-teal" onClick={handleOpenCreateBlog} style={{ marginTop: '0.5rem' }}>
                            <Plus size={16} /> Create First Article
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* DEDICATED EDITOR VIEW MATCHING SCREENSHOT */
                    <div className="blog-editor-wrapper">
                      {/* Top Header Bar */}
                      <div className="blog-editor-top-bar">
                        <div className="blog-editor-top-left">
                          <button className="btn-back-articles" onClick={() => setBlogViewMode('list')}>
                            <ArrowLeft size={16} /> Back to Articles
                          </button>

                          <div className="blog-editor-title-wrap">
                            <div className="blog-editor-icon-badge">
                              <Feather size={20} />
                            </div>
                            <div>
                              <h2>{editingBlogId ? 'Edit Blog Article' : 'Create New Blog Article'}</h2>
                              <p>Blog Management & Publishing</p>
                            </div>
                          </div>
                        </div>

                        <div className="blog-editor-top-right">
                          <div className="mode-tab-switch">
                            <button
                              className={`tab-switch-btn ${editorTab === 'editor' ? 'active' : ''}`}
                              onClick={() => setEditorTab('editor')}
                            >
                              <FileText size={15} /> Editor
                            </button>
                            <button
                              className={`tab-switch-btn ${editorTab === 'seo' ? 'active' : ''}`}
                              onClick={() => setEditorTab('seo')}
                            >
                              <Search size={15} /> SEO
                            </button>
                          </div>

                          <button className="btn-editor-draft" onClick={(e) => handlePublishOrSaveBlog(e, 'Draft')}>
                            <Bookmark size={15} /> Draft
                          </button>

                          <button className="btn-editor-publish" onClick={(e) => handlePublishOrSaveBlog(e, 'Published')}>
                            <Send size={15} /> Publish
                          </button>
                        </div>
                      </div>

                      {/* TAB 1: EDITOR */}
                      {editorTab === 'editor' && (
                        <div className="blog-editor-grid">
                          {/* Left Column: Title, Slug, Excerpt, Content */}
                          <div className="blog-editor-left">
                            <div className="blog-card-box">
                              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label>Article Title *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. 10 Essential Tips for Board Exam Preparation"
                                  value={blogForm.title}
                                  onChange={(e) => handleTitleChange(e.target.value)}
                                />
                              </div>

                              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label>URL Slug</label>
                                <div className="slug-input-wrapper">
                                  <span className="slug-prefix">/blog/</span>
                                  <input
                                    type="text"
                                    placeholder="custom-article-slug"
                                    value={blogForm.slug}
                                    onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                                  />
                                </div>
                              </div>

                              <div className="form-group">
                                <label>Short Excerpt / Summary *</label>
                                <textarea
                                  rows={3}
                                  required
                                  placeholder="Write a concise overview or key takeaway summary of the blog article..."
                                  value={blogForm.excerpt}
                                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                                />
                              </div>
                            </div>

                            {/* Rich Content Editor Box */}
                            <div className="blog-card-box">
                              <div className="rich-editor-header">
                                <label>
                                  <Feather size={16} color="#0284c7" /> Blog Content (Rich Text Format) *
                                </label>
                                <button
                                  type="button"
                                  className="btn-toggle-html"
                                  onClick={() => setHtmlSourceMode(!htmlSourceMode)}
                                >
                                  <Code size={14} /> {htmlSourceMode ? 'Edit Rich Text' : 'Edit HTML Source'}
                                </button>
                              </div>

                              {!htmlSourceMode && (
                                <div className="editor-toolbar">
                                  {/* Group 1: Text Formatting */}
                                  <button type="button" className="tb-btn" title="Bold" onClick={() => insertFormat('**', '**')}>
                                    <strong>B</strong>
                                  </button>
                                  <button type="button" className="tb-btn" title="Italic" onClick={() => insertFormat('*', '*')}>
                                    <em style={{ fontFamily: 'serif' }}>I</em>
                                  </button>
                                  <button type="button" className="tb-btn" title="Underline" onClick={() => insertFormat('<u>', '</u>')}>
                                    <u>U</u>
                                  </button>

                                  <div className="tb-divider" />

                                  {/* Group 2: Headings */}
                                  <select
                                    className="tb-select"
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        insertFormat(e.target.value + ' ', '\n');
                                        e.target.value = '';
                                      }
                                    }}
                                  >
                                    <option value="">Paragraph</option>
                                    <option value="# ">Heading 1</option>
                                    <option value="## ">Heading 2</option>
                                    <option value="### ">Heading 3</option>
                                  </select>

                                  <div className="tb-divider" />

                                  {/* Group 3: Lists */}
                                  <button type="button" className="tb-btn" title="Bullet List" onClick={() => insertFormat('- ')}>
                                    <List size={16} />
                                  </button>
                                  <button type="button" className="tb-btn" title="Numbered List" onClick={() => insertFormat('1. ')}>
                                    <ListOrdered size={16} />
                                  </button>

                                  <div className="tb-divider" />

                                  {/* Group 4: Alignments */}
                                  <button type="button" className="tb-btn" title="Align Left" onClick={() => insertFormat('<div style="text-align:left;">', '</div>')}>
                                    <AlignLeft size={16} />
                                  </button>
                                  <button type="button" className="tb-btn" title="Align Center" onClick={() => insertFormat('<div style="text-align:center;">', '</div>')}>
                                    <AlignCenter size={16} />
                                  </button>
                                  <button type="button" className="tb-btn" title="Align Right" onClick={() => insertFormat('<div style="text-align:right;">', '</div>')}>
                                    <AlignRight size={16} />
                                  </button>

                                  <div className="tb-divider" />

                                  {/* Group 5: Elements */}
                                  <button type="button" className="tb-btn" title="Insert Link" onClick={() => insertFormat('[Link Text](', ')')}>
                                    <Link2 size={16} />
                                  </button>
                                  <button type="button" className="tb-btn" title="Quote" onClick={() => insertFormat('> ')}>
                                    <Quote size={16} />
                                  </button>
                                  <button type="button" className="tb-btn" title="Code Block" onClick={() => insertFormat('```\n', '\n```')}>
                                    <Code size={16} />
                                  </button>
                                  <button type="button" className="tb-btn" title="Table" onClick={() => insertFormat('\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n')}>
                                    <Table size={16} />
                                  </button>

                                  <div className="tb-divider" />

                                  {/* Group 6: History */}
                                  <button type="button" className="tb-btn" title="Undo" onClick={() => insertFormat('', '')}>
                                    <RotateCcw size={16} />
                                  </button>
                                  <button type="button" className="tb-btn" title="Redo" onClick={() => insertFormat('', '')}>
                                    <RotateCw size={16} />
                                  </button>
                                </div>
                              )}

                              <textarea
                                id="blog-content-textarea"
                                className="rich-textarea"
                                rows={12}
                                required
                                placeholder="Type your full clinical article content here..."
                                value={blogForm.content}
                                onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                              />
                            </div>
                          </div>

                          {/* Right Column: Cover Image & Sidebar Controls */}
                          <div className="blog-editor-right">
                            {/* Cover Image Card */}
                            <div className="blog-card-box">
                              <label style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00b493' }}>
                                <ImageIcon size={18} /> Blog Cover Image
                              </label>

                              {(blogImagePreview || blogForm.image) ? (
                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', position: 'relative' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                    <img
                                      src={blogImagePreview || blogForm.image}
                                      alt="Blog Cover Preview"
                                      style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #00b493', flexShrink: 0 }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {blogImageFile ? blogImageFile.name : 'Cover Image Loaded'}
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: '#00b493', fontWeight: 600 }}>
                                        {blogImageFile ? `${(blogImageFile.size / 1024).toFixed(1)} KB (File Selected)` : 'Image Active'}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={handleRemoveBlogImage}
                                      title="Remove Cover Image"
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        color: '#dc2626',
                                        borderRadius: '6px',
                                        padding: '0.35rem 0.6rem',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        flexShrink: 0
                                      }}
                                    >
                                      <X size={15} /> Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div style={{ marginBottom: '0.85rem' }}>
                                    <label style={{ fontSize: '0.825rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                                      Upload Media / Cover Image File
                                    </label>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleBlogImageFileChange}
                                      style={{
                                        width: '100%',
                                        fontSize: '0.85rem',
                                        padding: '0.45rem',
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        background: '#ffffff'
                                      }}
                                    />
                                  </div>

                                  <div>
                                    <label style={{ fontSize: '0.825rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                                      Or Paste Cover Image URL
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="https://images.unsplash.com/..."
                                      value={blogForm.image}
                                      onChange={(e) => setBlogForm({ ...blogForm, image: e.target.value })}
                                      style={{
                                        width: '100%',
                                        padding: '0.55rem 0.75rem',
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.85rem'
                                      }}
                                    />
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Category, Author, Read Time, Status, Tags */}
                            <div className="blog-card-box">
                              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                                <label>Category *</label>
                                <select
                                  value={blogForm.category}
                                  onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                                >
                                  <option value="Spine & Joint Care">Spine & Joint Care</option>
                                  <option value="Post-Surgical Rehab">Post-Surgical Rehab</option>
                                  <option value="Ergonomics & Posture">Ergonomics & Posture</option>
                                  <option value="Neurological Rehab">Neurological Rehab</option>
                                  <option value="Sports Injury">Sports Injury</option>
                                  <option value="Learning Resources">Learning Resources</option>
                                  <option value="General Wellness">General Wellness</option>
                                </select>
                              </div>

                              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                                <label>Author Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={blogForm.author}
                                  onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                                />
                              </div>

                              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                                <label>Estimated Read Time</label>
                                <input
                                  type="text"
                                  value={blogForm.readTime}
                                  onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                                />
                              </div>

                              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                                <label>Status</label>
                                <select
                                  value={blogForm.status}
                                  onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
                                >
                                  <option value="Published">Published</option>
                                  <option value="Draft">Draft</option>
                                </select>
                              </div>

                              <div className="form-group">
                                <label>Tags</label>
                                <div className="tag-chips-wrapper">
                                  {(blogForm?.tags || []).map((tag, idx) => (
                                    <span key={idx} className="tag-chip">
                                      {tag}
                                      <button
                                        type="button"
                                        className="tag-close-btn"
                                        onClick={() => handleRemoveTag(tag)}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <div className="add-tag-row">
                                  <input
                                    type="text"
                                    placeholder="Add tag..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                      }
                                    }}
                                  />
                                  <button type="button" className="btn-add-tag" onClick={handleAddTag}>
                                    + Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: SEO */}
                      {editorTab === 'seo' && (
                        <div className="blog-editor-grid">
                          <div className="blog-editor-left">
                            <div className="blog-card-box">
                              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label>Meta Title</label>
                                <input
                                  type="text"
                                  placeholder="SEO Meta Title..."
                                  value={blogForm.metaTitle || blogForm.title}
                                  onChange={(e) => setBlogForm({ ...blogForm, metaTitle: e.target.value })}
                                />
                              </div>

                              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                                <label>Meta Description</label>
                                <textarea
                                  rows={3}
                                  placeholder="SEO Meta Description for Search Engines..."
                                  value={blogForm.metaDesc || blogForm.excerpt}
                                  onChange={(e) => setBlogForm({ ...blogForm, metaDesc: e.target.value })}
                                />
                              </div>

                              <div className="form-group">
                                <label>Focus Keywords</label>
                                <input
                                  type="text"
                                  placeholder="e.g. spine care, physiotherapy, back pain relief"
                                  value={blogForm.focusKeywords || blogForm.category}
                                  onChange={(e) => setBlogForm({ ...blogForm, focusKeywords: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="blog-editor-right">
                            <div className="blog-card-box">
                              <label>Google Search Preview</label>
                              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <div style={{ color: '#1a0dab', fontSize: '1rem', fontWeight: 600, textDecoration: 'underline', marginBottom: '0.2rem' }}>
                                  {blogForm.metaTitle || blogForm.title || 'Article Title'}
                                </div>
                                <div style={{ color: '#006621', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                                  https://satyaphyseo.com/blog/{blogForm.slug || 'article-slug'}
                                </div>
                                <div style={{ color: '#545454', fontSize: '0.825rem', lineHeight: '1.5' }}>
                                  {blogForm.metaDesc || blogForm.excerpt || 'Article summary description snippet...'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: NEWS & BULLETINS */}
              {activeTab === 'news' && (
                <div className="admin-panel">
                  <div className="admin-panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="admin-panel-title">Clinic News & Announcements</h2>
                      <p className="admin-subtitle">Publish official updates, health camps, and equipment announcements.</p>
                    </div>
                    <button className="btn btn-teal btn-sm" onClick={() => handleOpenNewsModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Plus size={16} /> Post New Update
                    </button>
                  </div>

                  {newsList.length > 0 ? (
                    <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Title & Category</th>
                            <th>Summary</th>
                            <th>Priority</th>
                            <th>Published Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedNews.map((item) => (
                            <tr key={item._id}>
                              <td>
                                <strong>{item.title}</strong>
                                <div className="table-sub-text">Category: {item.category}</div>
                              </td>
                              <td style={{ maxWidth: '280px' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{item.summary}</p>
                              </td>
                              <td>
                                {item.important ? (
                                  <span className="user-role-tag" style={{ background: '#fef2f2', color: '#dc2626' }}>
                                    High Priority
                                  </span>
                                ) : (
                                  <span className="user-role-tag" style={{ background: '#f1f5f9', color: '#475569' }}>
                                    Standard
                                  </span>
                                )}
                              </td>
                              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    className="btn-icon"
                                    title="Edit News"
                                    onClick={() => handleOpenNewsModal(item)}
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    className="btn-icon text-danger"
                                    title="Delete News"
                                    onClick={() => handleDeleteNews(item._id)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <FileText size={32} />
                      </div>
                      <h3>No News Updates Posted Yet</h3>
                      <p>Publish clinic announcements to keep patients informed.</p>
                      <button className="btn btn-teal btn-sm" onClick={() => handleOpenNewsModal()} style={{ marginTop: '0.75rem' }}>
                        <Plus size={16} /> Post First News Update
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: CONTACT INQUIRIES */}
              {activeTab === 'inquiries' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">Contact & Quick Inquiry Messages</h2>
                      <p className="admin-subtitle">Patient messages submitted via the website contact form.</p>
                    </div>
                  </div>

                  {inquiries.length > 0 ? (
                    <>
                      <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Name & Phone</th>
                            <th>Reported Symptoms</th>
                            <th>Preferred Time</th>
                            <th>Submission Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedInquiries.map((inq) => (
                            <tr key={inq._id}>
                              <td>
                                <strong>{inq.name}</strong>
                                <div className="table-sub-text">{inq.phone}</div>
                              </td>
                              <td>{inq.condition}</td>
                              <td>{inq.preferredTime}</td>
                              <td>{new Date(inq.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                      <Pagination currentPage={pageInquiries} totalPages={totalInquiryPages} onPageChange={setPageInquiries} totalItems={inquiries.length} itemsPerPage={10} />
                    </>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <MessageSquare size={32} />
                      </div>
                      <h3>No Contact Messages</h3>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 9: SYSTEM SETTINGS */}
              {activeTab === 'settings' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">System Settings & Clinic Information</h2>
                      <p className="admin-subtitle">Update clinic contact numbers, helpline, address, and business hours.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSettingsSubmit} className="booking-form-body">
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Clinic Name</label>
                        <input
                          type="text"
                          required
                          value={settings.clinicName}
                          onChange={(e) => setSettings({ ...settings, clinicName: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Primary Phone</label>
                        <input
                          type="text"
                          required
                          value={settings.phone}
                          onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label>Urgent Emergency Helpline</label>
                        <input
                          type="text"
                          required
                          value={settings.emergencyHelpline}
                          onChange={(e) => setSettings({ ...settings, emergencyHelpline: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Contact Email</label>
                        <input
                          type="email"
                          required
                          value={settings.email}
                          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Clinic Address</label>
                      <input
                        type="text"
                        required
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Business Operating Hours</label>
                      <input
                        type="text"
                        required
                        value={settings.businessHours}
                        onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Website Header Announcement Banner</label>
                      <input
                        type="text"
                        value={settings.siteAnnouncement}
                        onChange={(e) => setSettings({ ...settings, siteAnnouncement: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn btn-teal">
                      Save System Settings
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 10: SYSTEM NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <h2 className="admin-panel-title">System Notifications</h2>
                  </div>

                  {notifications.length > 0 ? (
                    <>
                      <div className="notifications-list">
                      {paginatedNotifications.map((n) => (
                        <div
                          key={n._id}
                          className={`notif-card ${!n.read ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="notif-header">
                            <span className="notif-title"><Bell size={16} /> {n.title}</span>
                            <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="notif-msg">{n.message}</p>
                        </div>
                      ))}
                    </div>
                      <Pagination currentPage={pageNotifications} totalPages={totalNotifPages} onPageChange={setPageNotifications} totalItems={notifications.length} itemsPerPage={10} />
                    </>
                  ) : (
                    <div className="empty-state-block">
                      <div className="empty-state-icon-wrap">
                        <Bell size={32} />
                      </div>
                      <h3>No System Notifications</h3>
                      <p>You have no notifications at this time.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Onboard New Doctor Modal */}
      {doctorModalOpen && (
        <div className="modal-backdrop" onClick={() => setDoctorModalOpen(false)}>
          <div className="booking-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '1.75rem' }}>
            <div className="booking-modal-header" style={{ marginBottom: '1.25rem' }}>
              <h3>Onboard New Physiotherapist</h3>
              <button className="modal-close-btn" onClick={() => setDoctorModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateDoctorSubmit} className="booking-form-body">
              <div className="form-group">
                <label>Doctor Full Name *</label>
                <input type="text" required placeholder="e.g. Dr. Neha Sharma" value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Qualification *</label>
                <input type="text" required value={newDoctor.qualification} onChange={(e) => setNewDoctor({ ...newDoctor, qualification: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Specialization *</label>
                <input type="text" required value={newDoctor.specialization} onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Consultation Fee *</label>
                <input type="text" required value={newDoctor.consultationFee} onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-teal" style={{ width: '100%', marginTop: '1rem' }}>Create Doctor Profile</button>
            </form>
          </div>
        </div>
      )}

      {/* Full-Screen Create Service Modal / Page */}
      {serviceModalOpen && (
        <div 
          className="admin-fullscreen-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: '#080e1e',
            color: '#ffffff',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Top Bar Header */}
          <div 
            style={{
              padding: '1.25rem 2rem',
              backgroundColor: '#0d152a',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {editingServiceId ? 'Edit Treatment Service' : 'Add New Treatment Service'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                  Configure clinical details, pricing, duration, and upload service picture.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setServiceModalOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Main Form Body */}
          <div style={{ padding: '2.5rem 2rem', maxWidth: '1050px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <form onSubmit={handleCreateServiceSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
                
                {/* Left Form Inputs */}
                <div style={{ background: '#0d152a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '2rem' }}>
                  
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                      Service Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Class IV High-Intensity Laser Therapy"
                      value={newService.title}
                      onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: '#080e1e',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                        Category *
                      </label>
                      <select
                        value={newService.category || 'Orthopedic Rehabilitation'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewService({ ...newService, category: val });
                          if (val !== 'Other / Custom' && val !== 'Other') {
                            setCustomCategory('');
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: '#080e1e',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="Orthopedic Rehabilitation">Orthopedic Rehabilitation</option>
                        <option value="Spine & Joint Care">Spine & Joint Care</option>
                        <option value="Sports Rehab">Sports Rehab</option>
                        <option value="Neuro Rehabilitation">Neuro Rehabilitation</option>
                        <option value="Advanced Pain Tech">Advanced Pain Tech</option>
                        <option value="Post-Operative Recovery">Post-Operative Recovery</option>
                        <option value="Other / Custom">Other / Custom</option>
                      </select>

                      {(newService.category === 'Other / Custom' || newService.category === 'Other') && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <label style={{ color: '#00b493', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block' }}>
                            Enter Custom Category *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Enter custom category name (e.g. Pediatric Physical Therapy)"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.65rem 0.9rem',
                              background: '#080e1e',
                              border: '1px solid #00b493',
                              borderRadius: '8px',
                              color: '#ffffff',
                              fontSize: '0.9rem',
                              outline: 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                        Estimated Duration *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 45 mins"
                        value={newService.duration}
                        onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: '#080e1e',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                        Consultation Price *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₹1,200"
                        value={newService.price}
                        onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: '#080e1e',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                        Display Icon
                      </label>
                      <select
                        value={newService.iconName || 'Activity'}
                        onChange={(e) => setNewService({ ...newService, iconName: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: '#080e1e',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="Activity">Activity / Heartbeat</option>
                        <option value="ShieldCheck">Shield Check / Defense</option>
                        <option value="Award">Award / Specialized</option>
                        <option value="HeartHandshake">Heart Handshake / Care</option>
                        <option value="Target">Target / Precision</option>
                        <option value="Users">Users / Family Care</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                      Clinical Description *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Describe the treatment technique, indications, technology used, and clinical benefits for patients..."
                      value={newService.desc}
                      onChange={(e) => setNewService({ ...newService, desc: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: '#080e1e',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        lineHeight: 1.6
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <button
                      type="button"
                      onClick={() => setServiceModalOpen(false)}
                      style={{
                        padding: '0.85rem 1.75rem',
                        background: 'transparent',
                        border: '1px solid #475569',
                        color: '#cbd5e1',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-teal"
                      style={{ padding: '0.85rem 2rem', fontSize: '0.95rem', fontWeight: 700 }}
                    >
                      {editingServiceId ? 'Save Changes' : 'Create Treatment Service'}
                    </button>
                  </div>

                </div>

                {/* Right Column: Picture Upload & Card Live Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Upload Picture Block */}
                  <div style={{ background: '#0d152a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#00b493', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ImageIcon size={18} /> Upload Service Picture
                    </h3>

                    {(serviceImagePreview || newService.image) ? (
                      <div style={{ background: '#080e1e', border: '1px solid #334155', borderRadius: '10px', padding: '0.85rem', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img
                            src={serviceImagePreview || newService.image}
                            alt="Service Selected Preview"
                            style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #00b493', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {serviceImageFile ? serviceImageFile.name : 'Selected Service Image'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#00b493', fontWeight: 600 }}>
                              {serviceImageFile ? `${(serviceImageFile.size / 1024).toFixed(1)} KB (File Selected)` : 'Image Loaded'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveServiceImage}
                            title="Remove Selected Image"
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#f87171',
                              borderRadius: '6px',
                              padding: '0.4rem 0.6rem',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              transition: 'all 0.2s ease',
                              flexShrink: 0
                            }}
                          >
                            <X size={15} /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ fontSize: '0.825rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                            Select Picture File (JPG, PNG, WEBP)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleServiceImageFileChange}
                            style={{
                              width: '100%',
                              fontSize: '0.85rem',
                              color: '#cbd5e1',
                              background: '#080e1e',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #334155'
                            }}
                          />
                        </div>

                        <div style={{ marginTop: '0.75rem' }}>
                          <label style={{ fontSize: '0.825rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                            Or Paste Image URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={newService.image}
                            onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.6rem 0.75rem',
                              background: '#080e1e',
                              border: '1px solid #334155',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Card Live Preview */}
                  <div style={{ background: '#0d152a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '0.85rem 1.25rem', background: '#080e1e', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>
                      Service Card Live Preview
                    </div>
                    <div style={{ height: '170px', background: '#080e1e', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={serviceImagePreview || newService.image || '/images/hero_physio.jpg'}
                        alt="Service Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(0,180,147,0.9)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.65rem', borderRadius: '999px' }}>
                        {(newService.category === 'Other / Custom' || newService.category === 'Other')
                          ? (customCategory || 'Custom Category')
                          : (newService.category || 'Orthopedic Rehabilitation')}
                      </span>
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
                        {newService.title || 'Service Title Preview'}
                      </h4>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.825rem', color: '#00b493', fontWeight: 700, marginBottom: '0.75rem' }}>
                        <span>⏱️ {newService.duration || '45 mins'}</span>
                        <span>💵 {newService.price || '₹1,200'}</span>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {newService.desc || 'Service description preview...'}
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Testimonial Modal */}
      {testimonialModalOpen && (
        <div className="modal-backdrop" onClick={() => setTestimonialModalOpen(false)}>
          <div className="booking-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '1.75rem', borderRadius: '16px' }}>
            <div className="booking-modal-header" style={{ marginBottom: '1.25rem' }}>
              <h3>{editingTestimonialId ? 'Edit Patient Testimonial' : 'Add New Patient Testimonial'}</h3>
              <button className="modal-close-btn" onClick={() => setTestimonialModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateTestimonialSubmit} className="booking-form-body">
              <div className="form-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Malhotra"
                  value={newTestimonial.name}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Condition / Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. L4-L5 Disc Herniation Patient"
                    value={newTestimonial.role}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Outcome Tag *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pain-Free in 4 Weeks"
                    value={newTestimonial.tag}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, tag: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Star Rating *</label>
                  <select
                    value={newTestimonial.rating}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
                    <option value={4}>4 Stars ⭐⭐⭐⭐</option>
                    <option value={3}>3 Stars ⭐⭐⭐</option>
                    <option value={2}>2 Stars ⭐⭐</option>
                    <option value={1}>1 Star ⭐</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Avatar / Photo URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={newTestimonial.avatar}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, avatar: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Testimonial Quote *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Patient's detailed recovery experience quote..."
                  value={newTestimonial.content}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline-white" onClick={() => setTestimonialModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-teal">
                  {editingTestimonialId ? 'Save Testimonial Changes' : 'Publish Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-Screen Add / Edit News Modal */}
      {newsModalOpen && (
        <div 
          className="admin-fullscreen-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 99999,
            backgroundColor: '#080e1e',
            color: '#ffffff',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Top Bar Header */}
          <div 
            style={{
              padding: '1.25rem 2rem',
              backgroundColor: '#0d152a',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setNewsModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {editingNewsId ? 'Edit Clinic News Update' : 'Post New Clinic News Update'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                  Publish official announcements, medical updates, health camps, and equipment additions.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNewsModalOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Main Form Body */}
          <div style={{ padding: '2.5rem 2rem', maxWidth: '1050px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
            <form onSubmit={handleNewsSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
                
                {/* Left Form Inputs */}
                <div style={{ background: '#0d152a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '2rem' }}>
                  
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                      News Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Satya Clinic Launches Advanced Class IV Laser Rehabilitation Unit"
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: '#080e1e',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                        Category *
                      </label>
                      <select
                        value={newsForm.category}
                        onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: '#080e1e',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="Announcement">Announcement</option>
                        <option value="Technology Update">Technology Update</option>
                        <option value="Community Event">Community Event</option>
                        <option value="Clinic Operation">Clinic Operation</option>
                        <option value="Health Bulletin">Health Bulletin</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                        Priority Flag *
                      </label>
                      <select
                        value={newsForm.important ? "true" : "false"}
                        onChange={(e) => setNewsForm({ ...newsForm, important: e.target.value === "true" })}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: '#080e1e',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="false">Standard Announcement</option>
                        <option value="true">High Priority / Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                      Brief Summary *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Concise overview snippet shown on public news cards..."
                      value={newsForm.summary}
                      onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: '#080e1e',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        lineHeight: 1.5
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem', display: 'block' }}>
                      Full Article Content *
                    </label>
                    <textarea
                      rows={6}
                      required
                      placeholder="Write the full news announcement content here..."
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: '#080e1e',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        lineHeight: 1.6
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <button
                      type="button"
                      onClick={() => setNewsModalOpen(false)}
                      style={{
                        padding: '0.85rem 1.75rem',
                        background: 'transparent',
                        border: '1px solid #475569',
                        color: '#cbd5e1',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-teal"
                      style={{ padding: '0.85rem 2rem', fontSize: '0.95rem', fontWeight: 700 }}
                    >
                      {editingNewsId ? 'Save News Update' : 'Publish News Update'}
                    </button>
                  </div>

                </div>

                {/* Right Column: Upload Media & Live Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Upload Media Block */}
                  <div style={{ background: '#0d152a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#00b493', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ImageIcon size={18} /> Upload Media / Banner
                    </h3>

                    {(newsMediaPreview || newsForm.image) ? (
                      <div style={{ background: '#080e1e', border: '1px solid #334155', borderRadius: '10px', padding: '0.85rem', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img
                            src={newsMediaPreview || newsForm.image}
                            alt="News Selected Media"
                            style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #00b493', flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {newsMediaFile ? newsMediaFile.name : 'Selected Media Image'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#00b493', fontWeight: 600 }}>
                              {newsMediaFile ? `${(newsMediaFile.size / 1024).toFixed(1)} KB (File Selected)` : 'Media Loaded'}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveNewsMedia}
                            title="Remove Selected Media"
                            style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#f87171',
                              borderRadius: '6px',
                              padding: '0.4rem 0.6rem',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              transition: 'all 0.2s ease',
                              flexShrink: 0
                            }}
                          >
                            <X size={15} /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: '1rem' }}>
                          <label style={{ fontSize: '0.825rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                            Select Media File (JPG, PNG, WEBP)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleNewsMediaFileChange}
                            style={{
                              width: '100%',
                              fontSize: '0.85rem',
                              color: '#cbd5e1',
                              background: '#080e1e',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #334155'
                            }}
                          />
                        </div>

                        <div style={{ marginTop: '0.75rem' }}>
                          <label style={{ fontSize: '0.825rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                            Or Paste Image URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={newsForm.image}
                            onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.6rem 0.75rem',
                              background: '#080e1e',
                              border: '1px solid #334155',
                              borderRadius: '6px',
                              color: '#ffffff',
                              fontSize: '0.85rem'
                            }}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* News Card Live Preview */}
                  <div style={{ background: '#0d152a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ padding: '0.85rem 1.25rem', background: '#080e1e', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>
                      News Card Live Preview
                    </div>
                    <div style={{ height: '170px', background: '#080e1e', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={newsMediaPreview || newsForm.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80'}
                        alt="News Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(0,180,147,0.9)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.65rem', borderRadius: '999px' }}>
                        {newsForm.category || 'Announcement'}
                      </span>
                      {newsForm.important && (
                        <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(220,38,38,0.9)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.65rem', borderRadius: '999px' }}>
                          High Priority
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.4rem' }}>
                        {newsForm.title || 'News Title Preview'}
                      </h4>
                      <p style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {newsForm.summary || 'News summary snippet preview...'}
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Physiotherapist Details Modal */}
      {viewDoctorModal && (
        <div className="modal-backdrop" onClick={() => setViewDoctorModal(null)}>
          <div
            className="booking-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', padding: '1.75rem', borderRadius: '16px' }}
          >
            <div className="booking-modal-header" style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src={viewDoctorModal.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80"}
                  alt={viewDoctorModal.name}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d9488' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80";
                  }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>
                    {viewDoctorModal.name}
                  </h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
                    {viewDoctorModal.title || 'Senior Physiotherapist'}
                  </p>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setViewDoctorModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="booking-form-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Account Status:</span>
                <span className={`status-badge ${viewDoctorModal.active ? 'status-completed' : 'status-cancelled'}`}>
                  {viewDoctorModal.active ? 'VERIFIED & ACTIVE' : 'UNVERIFIED / SUSPENDED'}
                </span>
              </div>

              {/* Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>
                    Qualification & Degree
                  </label>
                  <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
                    {viewDoctorModal.qualification || 'MPT (Orthopedics)'}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>
                    Experience
                  </label>
                  <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
                    {viewDoctorModal.experienceYears ? `${viewDoctorModal.experienceYears} Years Experience` : '8+ Years Exp.'}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>
                    Specialization
                  </label>
                  <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
                    {viewDoctorModal.specialization || 'Spine & Joint Care'}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>
                    Consultation Fee
                  </label>
                  <div style={{ fontWeight: '600', color: '#0d9488', fontSize: '1rem' }}>
                    {viewDoctorModal.consultationFee || '₹800'}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>
                    Email Address
                  </label>
                  <div style={{ fontWeight: '500', color: '#334155', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                    {viewDoctorModal.email || viewDoctorModal.user?.email || 'doctor@satyaphyseo.com'}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>
                    Phone Number
                  </label>
                  <div style={{ fontWeight: '500', color: '#334155', fontSize: '0.9rem' }}>
                    {viewDoctorModal.phone || viewDoctorModal.user?.phone || '+91 98765 43210'}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fefce8', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #fef08a' }}>
                <Star size={18} fill="#eab308" color="#eab308" />
                <span style={{ fontWeight: '700', color: '#854d0e', fontSize: '0.95rem' }}>
                  {viewDoctorModal.rating || 4.9} / 5.0
                </span>
                <span style={{ color: '#a16207', fontSize: '0.85rem' }}>
                  ({viewDoctorModal.reviewsCount || 120} Patient Reviews)
                </span>
              </div>

              {/* Bio */}
              <div>
                <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>
                  Professional Summary / Bio
                </label>
                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {viewDoctorModal.bio || 'Dedicated physical therapy specialist focused on non-surgical recovery, biomechanics restoration, and movement rehabilitation.'}
                </div>
              </div>

              {/* Services Offered */}
              {viewDoctorModal.servicesOffered && viewDoctorModal.servicesOffered.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: '700', display: 'block', marginBottom: '0.35rem' }}>
                    Services & Treatments Provided
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {viewDoctorModal.servicesOffered.map((serv, idx) => (
                      <span key={idx} style={{ background: '#ccfbf1', color: '#0f766e', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                        {serv}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="btn btn-outline-white"
                  onClick={() => setViewDoctorModal(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className={`btn ${viewDoctorModal.active ? 'btn-outline-dark' : 'btn-teal'}`}
                  onClick={() => {
                    const docId = viewDoctorModal._id;
                    handleVerifyDoctor(docId);
                    setViewDoctorModal((prev) => prev ? { ...prev, active: !prev.active } : null);
                  }}
                >
                  {viewDoctorModal.active ? 'Suspend Account' : 'Verify & Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Physio Verification Details Modal */}
      {viewPhysioModal && (
        <div className="modal-backdrop" style={{ display: 'flex', zIndex: 1100 }}>
          <div className="modal-container" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} style={{ color: '#00b493' }} />
                <h3>Physiotherapist Professional Verification Details</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setViewPhysioModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="booking-form-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Basic Header Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <img
                  src={viewPhysioModal.profilePhoto || viewPhysioModal.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={viewPhysioModal.name}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00b493' }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>{viewPhysioModal.name}</h4>
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{viewPhysioModal.email} · {viewPhysioModal.phone}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <span className="status-badge status-upcoming">Role: Physio</span>
                    <span className={`status-badge ${viewPhysioModal.approvalStatus === 'APPROVED' ? 'status-completed' : viewPhysioModal.approvalStatus === 'REJECTED' ? 'status-cancelled' : ''}`} style={viewPhysioModal.approvalStatus === 'PENDING' ? { background: '#fef3c7', color: '#b45309' } : {}}>
                      Approval: {viewPhysioModal.approvalStatus || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid 1: Professional Details */}
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  A. Professional Credentials
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', fontSize: '0.85rem' }}>
                  <div>
                    <label style={{ color: '#64748b', fontWeight: 'bold' }}>Qualification</label>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{viewPhysioModal.qualification || 'N/A'}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontWeight: 'bold' }}>Specialization</label>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{viewPhysioModal.specialization || 'N/A'}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontWeight: 'bold' }}>Experience</label>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{viewPhysioModal.experience ? `${viewPhysioModal.experience} Years` : 'N/A'}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontWeight: 'bold' }}>Registration Number</label>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{viewPhysioModal.registrationNumber || 'N/A'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ color: '#64748b', fontWeight: 'bold' }}>Council / Authority</label>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{viewPhysioModal.registrationAuthority || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Grid 2: Practice Details */}
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  B. Practice & Location
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem', fontSize: '0.85rem' }}>
                  <div>
                    <label style={{ color: '#64748b', fontWeight: 'bold' }}>Clinic / Workplace</label>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{viewPhysioModal.clinicName || 'N/A'}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontWeight: 'bold' }}>City</label>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{viewPhysioModal.city || 'N/A'}</div>
                  </div>
                  <div>
                    <label style={{ color: '#64748b', fontWeight: 'bold' }}>Consultation Type</label>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{viewPhysioModal.consultationType || 'Both'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 3' }}>
                    <label style={{ color: '#64748b', fontWeight: 'bold' }}>Full Address</label>
                    <div style={{ color: '#334155' }}>{viewPhysioModal.address || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Grid 3: Additional Professional Info */}
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  C. Additional Information
                </h5>
                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <strong style={{ color: '#64748b' }}>Languages Spoken: </strong>
                    <span style={{ color: '#0f172a' }}>
                      {Array.isArray(viewPhysioModal.languages) ? viewPhysioModal.languages.join(', ') : (viewPhysioModal.languages || 'N/A')}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: '#64748b' }}>Areas of Expertise: </strong>
                    <span style={{ color: '#0f172a' }}>
                      {Array.isArray(viewPhysioModal.areasOfExpertise) ? viewPhysioModal.areasOfExpertise.join(', ') : (viewPhysioModal.areasOfExpertise || 'N/A')}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Professional Bio:</strong>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', color: '#334155', fontStyle: 'italic' }}>
                      {viewPhysioModal.bio || 'No bio submitted.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 4: Verification Documents */}
              <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  D. Verification Documents & Certificates
                </h5>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#166534' }}>1. Council Registration Certificate: </strong>
                    {viewPhysioModal.registrationCertificate ? (
                      <a
                        href={viewPhysioModal.registrationCertificate}
                        className="btn btn-teal doc-btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem', padding: '0.25rem 0.65rem', fontSize: '0.8rem' }}
                      >
                        <FileText size={14} /> View Certificate File
                      </a>
                    ) : (
                      <span style={{ color: '#991b1b', fontSize: '0.85rem', marginLeft: '0.5rem' }}>Not Uploaded</span>
                    )}
                  </div>

                  {viewPhysioModal.certifications && viewPhysioModal.certifications.length > 0 && (
                    <div>
                      <strong style={{ fontSize: '0.85rem', color: '#166534', display: 'block', marginBottom: '0.3rem' }}>2. Additional Certifications:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {viewPhysioModal.certifications.map((certUrl, idx) => (
                          <a
                            key={idx}
                            href={certUrl}
                            className="btn btn-outline-dark doc-btn-sm"
                            style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <FileText size={12} /> Certification #{idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  className="btn btn-outline-white"
                  onClick={() => setViewPhysioModal(null)}
                >
                  Close
                </button>

                {viewPhysioModal.approvalStatus !== 'REJECTED' && (
                  <button
                    type="button"
                    className="action-btn-danger-text"
                    onClick={() => {
                      const id = viewPhysioModal._id;
                      const name = viewPhysioModal.name;
                      setRejectPhysioModal({ isOpen: true, physioId: id, physioName: name, reason: '' });
                    }}
                  >
                    Reject Registration
                  </button>
                )}

                {viewPhysioModal.approvalStatus !== 'APPROVED' && (
                  <button
                    type="button"
                    className="btn btn-teal"
                    onClick={() => handleApprovePhysio(viewPhysioModal._id)}
                  >
                    Approve Registration
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Confirmation Modal */}
      {rejectPhysioModal.isOpen && (
        <div className="modal-backdrop" style={{ display: 'flex', zIndex: 1200 }}>
          <div className="modal-container" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3>Reject Physiotherapist Registration</h3>
              <button
                className="modal-close-btn"
                onClick={() => setRejectPhysioModal({ isOpen: false, physioId: null, physioName: '', reason: '' })}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectPhysioSubmit} className="booking-form-body">
              <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' }}>
                You are rejecting the registration application for <strong>{rejectPhysioModal.physioName}</strong>. Please state the rejection reason below (this will be displayed to the physio upon login).
              </p>

              <div className="form-group">
                <label>Rejection Reason *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Council Registration Certificate image is blurry or expired. Please upload a clear original document."
                  value={rejectPhysioModal.reason}
                  onChange={(e) => setRejectPhysioModal({ ...rejectPhysioModal, reason: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-outline-white"
                  onClick={() => setRejectPhysioModal({ isOpen: false, physioId: null, physioName: '', reason: '' })}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ background: '#ef4444', color: '#ffffff', border: 'none' }}
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
