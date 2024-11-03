import axios from 'axios';

// Create an axios instance with a base URL
const apiClient = axios.create({
  baseURL: 'https://learnitor.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
