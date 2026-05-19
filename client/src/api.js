const getApiBaseUrl = () => {
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const PRODUCTION_URL = 'https://aiu-backend.onrender.com/api'; 
    const LOCAL_URL = 'http://localhost:5000/api';

    return isProduction ? (import.meta.env.VITE_API_URL || PRODUCTION_URL) : LOCAL_URL;
};

const API_BASE_URL = getApiBaseUrl();

export const authFetch = async (url, options = {}) => {
  const sessionStr = sessionStorage.getItem('aiu_session');
  let token = null;
  if (sessionStr) {
    try {
      token = JSON.parse(sessionStr).token;
    } catch(e) {}
  }
  
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`; // Inject JWT token automatically
  }
  
  return fetch(url, { ...options, headers });
};

export default API_BASE_URL;
