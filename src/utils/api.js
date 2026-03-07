// base interceptor
import axios from "axios";
const BASE_URL = process.env.REACT_APP_ADMIN_API_URL;

// Create the base axios instance
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    withCredentials: true,
});

// Response interceptor - extracts data from BaseController responses
api.interceptors.response.use(
    (response) => {
        // Extract data from { success: true, message: "...", data: {...} }
        if (response.data && response.data.data !== undefined) {
            response.data = response.data.data;
        }
        return response;
    },

    (config) => {
        const state = store?.getState()?.auth;
        const token = state?.token;
        const role = state?.role; // 'admin' | 'super-admin'

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (role) {
            config.headers['X-Admin-Role'] = role;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Store reference for request interceptor
let store;

// Function to inject store once
export const injectStore = (_store) => {
    store = _store;

    // Request interceptor - adds auth token
    api.interceptors.request.use(
        (config) => {
            const token = store?.getState()?.auth?.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
};

export default api;