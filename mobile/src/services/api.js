import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Production: nurova.technology | Development: localhost
const API_URL = __DEV__ 
  ? (Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api')
  : 'http://nurova.technology/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if error is 401 (Unauthorized) and logout/redirect if needed
        if (error.response && error.response.status === 401) {
            // Optional: Trigger logout logic
        }
        return Promise.reject(error);
    }
);

export default api;
