
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://learnitor.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally, you can set up request interceptors
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token to headers, if needed
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optionally, set up response interceptors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)

);

export default apiClient;
