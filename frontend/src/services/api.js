import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000, // 120 seconds — Render free-tier can take up to 60s to wake
});

// Add a request interceptor to include the auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Retry interceptor — on network error or timeout, retry up to 3 times
// with increasing delays (5s, 10s, 15s) to handle Render free-tier cold start
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    // Only retry on network errors (no response) or 5xx server errors
    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500;
    const isTimeout = error.code === 'ECONNABORTED';

    if ((isNetworkError || isServerError || isTimeout) && !config._retryCount) {
      config._retryCount = 0;
    }

    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [5000, 10000, 15000]; // 5s, 10s, 15s
    if ((isNetworkError || isServerError || isTimeout) && config._retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[config._retryCount] || 10000;
      config._retryCount += 1;
      await new Promise(resolve => setTimeout(resolve, delay));
      return API(config);
    }

    return Promise.reject(error);
  }
);

// Helper to extract a friendly error message
export const getErrorMessage = (err) => {
  if (!err.response && (err.code === 'ECONNABORTED' || err.message?.includes('Network Error') || err.message?.includes('timeout'))) {
    return 'Server is starting up. Please wait 30 seconds and try again.';
  }
  return err.response?.data?.error || err.response?.data?.detail || err.message || 'An error occurred.';
};

// Auth
export const login = (data) => API.post('/auth/login/', data);
export const register = (data) => API.post('/auth/register/', data);
export const logout = () => API.post('/auth/logout/');
export const getMe = () => API.get('/auth/me/');
export const changePassword = (data) => API.post('/auth/change-password/', data);
export const deleteAccount = () => API.delete('/auth/delete-account/');

// Cars
export const getCars = () => API.get('/cars/');
export const getCar = (id) => API.get(`/cars/${id}/`);
export const createCar = (data) => API.post('/cars/', data);
export const updateCar = (id, data) => API.patch(`/cars/${id}/`, data);
export const deleteCar = (id) => API.delete(`/cars/${id}/`);

// Services (Service Requests)
export const getServices = () => API.get('/services/');
export const createService = (data) => API.post('/services/', data);
export const updateService = (id, data) => API.put(`/services/${id}/`, data);
export const deleteService = (id) => API.delete(`/services/${id}/`);
export const updateServiceStatus = (id, status, extra = {}) => API.post(`/services/${id}/update-status/`, { status, ...extra });

// Bookings
export const getBookings = () => API.get('/bookings/');
export const createBooking = (data) => API.post('/bookings/', data);
export const updateBooking = (id, data) => API.put(`/bookings/${id}/`, data);
export const deleteBooking = (id) => API.delete(`/bookings/${id}/`);

// Customers
export const getCustomers = () => API.get('/customers/');
export const createCustomer = (data) => API.post('/customers/', data);
export const updateCustomer = (id, data) => API.put(`/customers/${id}/`, data);
export const deleteCustomer = (id) => API.delete(`/customers/${id}/`);

// Dashboard
export const getDashboardStats = () => API.get('/bookings/dashboard-stats/');

// Admin User Management
export const getUsers = () => API.get('/auth/users/');
export const toggleUserStatus = (userId) => API.post(`/auth/users/${userId}/toggle-status/`);

export default API;
