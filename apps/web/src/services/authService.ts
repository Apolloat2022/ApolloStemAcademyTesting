import axios from 'axios';
import type { User } from '@apollo/types';

const API_URL = import.meta.env.DEV
    ? 'http://localhost:8787'
    : 'https://apolloacademyaiteacher.revanaglobal.workers.dev';

export const authService = {
    setToken: (token: string) => {
        localStorage.setItem('apollo_token', token);
    },
    getToken: () => {
        return localStorage.getItem('apollo_token');
    },
    setUser: (user: User) => {
        localStorage.setItem('apollo_user', JSON.stringify(user));
    },
    getUser: (): User | null => {
        const user = localStorage.getItem('apollo_user');
        return user ? JSON.parse(user) : null;
    },
    logout: () => {
        localStorage.removeItem('apollo_token');
        localStorage.removeItem('apollo_user');
    },
    verifyGoogleToken: async (tokenId: string) => {
        const response = await axios.post(`${API_URL}/auth/google`, { tokenId });
        return response.data;
    }
};
