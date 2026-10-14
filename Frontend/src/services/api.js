const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1`;

// Helper for standard JSON fetch requests
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem("satya_token");
  
  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include"
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || "API Request Failed");
      error.status = response.status;
      error.code = data.code;
      error.data = data;
      throw error;
    }
    return data;
  } catch (err) {
    if (err.message === "Failed to fetch") {
      throw new Error("Unable to connect to backend server. Please verify backend is running on http://localhost:5000");
    }
    throw err;
  }
}

export const api = {
  // Public APIs
  getServices: (query = "") => fetchAPI(`/public/services${query}`),
  getServiceBySlug: (slug) => fetchAPI(`/public/services/${slug}`),
  getDoctors: (search = "", specialization = "all") => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (specialization && specialization !== "all") params.append("specialization", specialization);
    const queryString = params.toString() ? `?${params.toString()}` : "";
    return fetchAPI(`/public/doctors${queryString}`);
  },
  getTestimonials: () => fetchAPI("/public/testimonials"),
  getFAQs: () => fetchAPI("/public/faqs"),
  getClinicInfo: () => fetchAPI("/public/clinic-info"),
  getBlogs: () => fetchAPI("/public/blogs"),
  getBlogBySlug: (slug) => fetchAPI(`/public/blogs/${slug}`),
  getNews: () => fetchAPI("/public/news"),
  getNewsBySlug: (slug) => fetchAPI(`/public/news/${slug}`),

  // Auth APIs
  register: (userData) => fetchAPI("/auth/register", { method: "POST", body: JSON.stringify(userData) }),
  login: (credentials) => fetchAPI("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  logout: () => fetchAPI("/auth/logout", { method: "POST" }),
  getMe: () => fetchAPI("/auth/me"),
  updateProfile: (profileData) => fetchAPI("/auth/profile", { method: "PUT", body: JSON.stringify(profileData) }),
  changePassword: (passwordData) => fetchAPI("/auth/change-password", { method: "PUT", body: JSON.stringify(passwordData) }),

  // Inquiries & Appointments APIs
  submitInquiry: (inquiryData) => fetchAPI("/inquiries", { method: "POST", body: JSON.stringify(inquiryData) }),
  createAppointment: (appointmentData) => fetchAPI("/appointments", { method: "POST", body: JSON.stringify(appointmentData) }),
  getMyAppointments: () => fetchAPI("/appointments/my-appointments"),
  cancelAppointment: (id) => fetchAPI(`/appointments/${id}/cancel`, { method: "PUT" }),

  // Online Consultation Requests API (supports FormData for Medical Report upload)
  createOnlineConsultation: (formData) => fetchAPI("/online-consultations", { method: "POST", body: formData }),
  getMyOnlineConsultations: () => fetchAPI("/online-consultations/my-consultations"),

  // Notifications API
  getNotifications: () => fetchAPI("/notifications"),
  markNotificationRead: (id) => fetchAPI(`/notifications/${id}/read`, { method: "PUT" }),
  markAllNotificationsRead: () => fetchAPI("/notifications/mark-all-read", { method: "PUT" }),
  markNotificationsTypeRead: (payload) => fetchAPI("/notifications/mark-type-read", { method: "PUT", body: JSON.stringify(typeof payload === 'object' ? payload : { type: payload }) }),

  // Medical Reports APIs (Cloudinary Upload)
  uploadReport: (formData) => fetchAPI("/reports/upload", { method: "POST", body: formData }),
  getMyReports: () => fetchAPI("/reports/my-reports"),
  getAppointmentReports: (appointmentId) => fetchAPI(`/reports/appointment/${appointmentId}`),
  deleteReport: (id) => fetchAPI(`/reports/${id}`, { method: "DELETE" }),

  // Doctor / Physiotherapist APIs
  getDoctorProfile: () => fetchAPI("/doctor/profile"),
  updateDoctorProfile: (data) => fetchAPI("/doctor/profile", { method: "PUT", body: data instanceof FormData ? data : JSON.stringify(data) }),
  getDoctorAppointments: () => fetchAPI("/doctor/appointments"),
  getDoctorPatientHistory: () => fetchAPI("/doctor/patient-history"),
  acceptDoctorAppointment: (id) => fetchAPI(`/doctor/appointments/${id}/accept`, { method: "PUT" }),
  rejectDoctorAppointment: (id, reason = "") => fetchAPI(`/doctor/appointments/${id}/reject`, { method: "PUT", body: JSON.stringify({ reason }) }),
  updateAppointmentStatus: (id, status, note = "") => fetchAPI(`/doctor/appointments/${id}/status`, { method: "PUT", body: JSON.stringify({ status, note }) }),
  rescheduleDoctorAppointment: (id, date, timeSlot) => fetchAPI(`/doctor/appointments/${id}/reschedule`, { method: "PUT", body: JSON.stringify({ date, timeSlot }) }),
  updatePaymentStatus: (id, paymentStatus) => fetchAPI(`/doctor/appointments/${id}/payment`, { method: "PUT", body: JSON.stringify({ paymentStatus }) }),

  // Physio Onboarding & Registration APIs
  submitPhysioRegistration: (formData) => fetchAPI("/auth/physio-registration", { method: "POST", body: formData }),

  // Admin Physio Approval APIs
  getPhysioApprovals: (status = "") => fetchAPI(`/admin/physio-approvals${status ? `?status=${status}` : ""}`),
  approvePhysioRegistration: (id) => fetchAPI(`/admin/physio-approvals/${id}/approve`, { method: "PUT" }),
  rejectPhysioRegistration: (id, reason = "") => fetchAPI(`/admin/physio-approvals/${id}/reject`, { method: "PUT", body: JSON.stringify({ reason }) }),

  // Admin APIs
  getAdminStats: () => fetchAPI("/admin/stats"),
  getAdminAppointments: () => fetchAPI("/admin/appointments"),
  approveAdminAppointment: (id) => fetchAPI(`/admin/appointments/${id}/approve`, { method: "PUT" }),
  rejectAdminAppointment: (id, reason = "") => fetchAPI(`/admin/appointments/${id}/reject`, { method: "PUT", body: JSON.stringify({ reason }) }),
  markAdminAppointmentsRead: () => fetchAPI("/admin/appointments/mark-read", { method: "PUT" }),
  updateAdminAppointmentStatus: (id, status, note = "") => fetchAPI(`/admin/appointments/${id}/status`, { method: "PUT", body: JSON.stringify({ status, note }) }),
  updateAdminPaymentStatus: (id, paymentStatus) => fetchAPI(`/admin/appointments/${id}/payment`, { method: "PUT", body: JSON.stringify({ paymentStatus }) }),
  getAdminDoctors: () => fetchAPI("/admin/doctors"),
  verifyDoctor: (id) => fetchAPI(`/admin/doctors/${id}/verify`, { method: "PUT" }),
  createAdminDoctor: (doctorData) => fetchAPI("/admin/doctors", { method: "POST", body: JSON.stringify(doctorData) }),
  getAdminUsers: () => fetchAPI("/admin/users"),
  updateUserRole: (id, role) => fetchAPI(`/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }),
  createAdminService: (serviceData) => {
    if (serviceData instanceof FormData) {
      return fetchAPI("/admin/services", { method: "POST", body: serviceData });
    }
    return fetchAPI("/admin/services", { method: "POST", body: JSON.stringify(serviceData) });
  },
  updateAdminService: (id, serviceData) => {
    if (serviceData instanceof FormData) {
      return fetchAPI(`/admin/services/${id}`, { method: "PUT", body: serviceData });
    }
    return fetchAPI(`/admin/services/${id}`, { method: "PUT", body: JSON.stringify(serviceData) });
  },
  getAdminOnlineConsultations: () => fetchAPI("/admin/online-consultations"),
  getAdminTestimonials: () => fetchAPI("/admin/testimonials"),
  createAdminTestimonial: (data) => fetchAPI("/admin/testimonials", { method: "POST", body: JSON.stringify(data) }),
  updateAdminTestimonial: (id, data) => fetchAPI(`/admin/testimonials/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAdminTestimonial: (id) => fetchAPI(`/admin/testimonials/${id}`, { method: "DELETE" }),
  getAdminInquiries: () => fetchAPI("/admin/inquiries"),
  markAdminInquiriesRead: () => fetchAPI("/admin/inquiries/mark-read", { method: "PUT" }),
  getSystemSettings: () => fetchAPI("/admin/settings"),
  updateSystemSettings: (data) => fetchAPI("/admin/settings", { method: "PUT", body: JSON.stringify(data) }),
  getAdminBlogs: () => fetchAPI("/admin/blogs"),
  markAdminBlogsRead: () => fetchAPI("/admin/blogs/mark-read", { method: "PUT" }),
  createAdminBlog: (data) => {
    if (data instanceof FormData) {
      return fetchAPI("/admin/blogs", { method: "POST", body: data });
    }
    return fetchAPI("/admin/blogs", { method: "POST", body: JSON.stringify(data) });
  },
  updateAdminBlog: (id, data) => {
    if (data instanceof FormData) {
      return fetchAPI(`/admin/blogs/${id}`, { method: "PUT", body: data });
    }
    return fetchAPI(`/admin/blogs/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteAdminBlog: (id) => fetchAPI(`/admin/blogs/${id}`, { method: "DELETE" }),
  getAdminNews: () => fetchAPI("/admin/news"),
  markAdminNewsRead: () => fetchAPI("/admin/news/mark-read", { method: "PUT" }),
  createAdminNews: (data) => {
    if (data instanceof FormData) {
      return fetchAPI("/admin/news", { method: "POST", body: data });
    }
    return fetchAPI("/admin/news", { method: "POST", body: JSON.stringify(data) });
  },
  updateAdminNews: (id, data) => {
    if (data instanceof FormData) {
      return fetchAPI(`/admin/news/${id}`, { method: "PUT", body: data });
    }
    return fetchAPI(`/admin/news/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },
  deleteAdminNews: (id) => fetchAPI(`/admin/news/${id}`, { method: "DELETE" })
};
