import axios from 'axios';
import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'https://apolloacademyaiteacher.revanaglobal.workers.dev';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for API calls
api.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('API Request:', config.method?.toUpperCase(), config.url, 'with token');
        } else {
            console.warn('API Request:', config.method?.toUpperCase(), config.url, 'WITHOUT token');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
let justLoggedIn = false;
let loginTimestamp = 0;

// Export function to mark successful login
export const markLoginSuccess = () => {
    justLoggedIn = true;
    loginTimestamp = Date.now();
    // Reset after 5 seconds
    setTimeout(() => {
        justLoggedIn = false;
    }, 5000);
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Only logout and redirect if we get a 401 AND we're not already on the login page
        // AND we didn't just log in (give 5 seconds grace period)
        const timeSinceLogin = Date.now() - loginTimestamp;
        const shouldLogout = error.response?.status === 401
            && !window.location.pathname.includes('/login')
            && (!justLoggedIn || timeSinceLogin > 5000);

        if (shouldLogout) {
            console.error('Authentication failed:', error.response?.data);
            authService.logout();
            window.location.href = '/login';
        } else if (error.response?.status === 401) {
            console.warn('401 error suppressed during grace period:', error.config?.url);
        }
        return Promise.reject(error);
    }
);
