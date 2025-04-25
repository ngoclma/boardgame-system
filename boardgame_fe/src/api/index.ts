import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://0.0.0.0:8000/api';
const API_BASE_URL = 'https://boardgame-system-production.up.railway.app/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;