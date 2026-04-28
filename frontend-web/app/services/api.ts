import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

let logoutCallback: (() => void) | null = null;
export const setLogoutCallback = (cb: () => void) => { logoutCallback = cb; };

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && logoutCallback) logoutCallback();
    return Promise.reject(error);
  }
);

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });
export const getMe = () => api.get('/auth/me');
export const updateProfile = (data: object) => api.patch('/auth/profile', data);

// Incidencias
export const getIncidents = (filters: object = {}) =>
  api.get('/incidents', { params: filters });
export const getIncident = (id: number | string) => api.get(`/incidents/${id}`);
export const createIncident = (data: object) => api.post('/incidents', data);
export const updateStatus = (id: number | string, status: string) =>
  api.patch(`/incidents/${id}/status`, { status });
export const addComment = (id: number | string, message: string) =>
  api.post(`/incidents/${id}/comments`, { message });
export const assignTechnician = (id: number | string, technician_id: number) =>
  api.patch(`/incidents/${id}/assign`, { technician_id });

// Categorías
export const getCategories = () => api.get('/incidents/categories');

// Dashboard
export const getDashboard = () => api.get('/dashboard');

// Usuarios
export const getTechnicians = () => api.get('/users/technicians');
export const getUsers = () => api.get('/users');
export const toggleUserActive = (id: number) => api.patch(`/users/${id}/active`);
export const createUser = (data: object) => api.post('/users', data);

// Foro
export const getForumPosts = () => api.get('/forum');
export const getForumPost = (id: number | string) => api.get(`/forum/${id}`);
export const createForumPost = (data: object) => api.post('/forum', data);
export const deleteForumPost = (id: number | string) => api.delete(`/forum/${id}`);
export const addForumComment = (postId: number | string, message: string) =>
  api.post(`/forum/${postId}/comments`, { message });
export const deleteForumComment = (postId: number | string, commentId: number | string) =>
  api.delete(`/forum/${postId}/comments/${commentId}`);

// Base de conocimiento
export const getKnowledgeArticles = (params: object = {}) =>
  api.get('/knowledge', { params });
export const getKnowledgeArticle = (id: number | string) => api.get(`/knowledge/${id}`);
export const createKnowledgeArticle = (data: object) => api.post('/knowledge', data);
export const updateKnowledgeArticle = (id: number | string, data: object) =>
  api.put(`/knowledge/${id}`, data);
export const deleteKnowledgeArticle = (id: number | string) =>
  api.delete(`/knowledge/${id}`);

// Notificaciones
export const getNotifications = () => api.get('/notifications');
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markNotificationRead = (id: number | string) =>
  api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');

export default api;
