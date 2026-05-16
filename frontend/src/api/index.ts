import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pollify_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pollify_token');
      localStorage.removeItem('pollify_user');
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  googleLogin: (data: { idToken: string }) =>
    api.post('/auth/google', data),
  me: () => api.get('/auth/me'),
};

// Polls
export const pollsApi = {
  create: (data: any) => api.post('/polls', data),
  myPolls: () => api.get('/polls/my'),
  getByToken: (token: string) => api.get(`/polls/share/${token}`),
  submitResponse: (token: string, data: any) => api.post(`/polls/share/${token}/respond`, data),
  analytics: (id: string) =>api.get(`/polls/${id}/analytics`),
  publish: (id: string) => api.post(`/polls/${id}/publish`),
  close: (id: string) => api.post(`/polls/${id}/close`),
  delete: (id: string) => api.delete(`/polls/${id}`),
  get: (id: string) => api.get(`/polls/${id}`),
  
};
