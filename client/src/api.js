const getApiBaseUrl = () => {
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    // Explicitly target your Render backend for the deployed site
    const PRODUCTION_URL = 'https://aiu-backend.onrender.com/api'; // Replace with your actual Render URL if different
    const LOCAL_URL = 'http://localhost:5000/api';

    return isProduction ? (import.meta.env.VITE_API_URL || PRODUCTION_URL) : LOCAL_URL;
};

const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;
