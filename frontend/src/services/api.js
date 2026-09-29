import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
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
