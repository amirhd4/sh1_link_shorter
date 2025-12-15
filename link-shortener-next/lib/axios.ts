import axios from 'axios';
import config from '../config';

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true, // ✅ مهم
});

// میتوانید Interceptor ها را برای مدیریت توکن JWT در اینجا اضافه کنید
// apiClient.interceptors.request.use((config: any) => {
//     const token = localStorage.getItem('access_token');
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
// });


export default apiClient;