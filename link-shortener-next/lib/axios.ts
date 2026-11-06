import axios from "axios";
import config from "@/config";

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true,
});

apiClient.interceptors.request.use((request) => {
  console.log("REQUEST URL:", request.baseURL + request.url);
  return request;
});

// 1️⃣ یک نمونه جداگانه بدون اینترسپتور برای عملیات حساس رفرش توکن
const refreshClient = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const url = originalRequest.url || "";

    // 2️⃣ کنترل سخت‌گیرانه مسیرهای احراز هویت: اگر این درخواست‌ها 401 دادند، مستقیم ریدایرکت به لاگین
    if (
      url.includes("/auth/refresh") ||
      url.includes("/auth/verify-otp-login") ||
      url.includes("/auth/token")
    ) {
      if (typeof window !== "undefined") {
        window.location.replace("/login?expired=true");
      }
      return Promise.reject(error);
    }

    // هندل خطای 401 برای بقیه کامپوننت‌ها (مثل /me)
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // 3️⃣ استفاده از کلاینت امن و ایزوله شده برای رفرش
        await refreshClient.post("/auth/refresh", {});

        isRefreshing = false;
        processQueue(null);

        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        // 4️⃣ قبل از ریدایرکت، یک پرچم موقت در sessionStorage می‌گذاریم تا جلوی درخواست‌های موازی بعدی گرفته شود
        if (typeof window !== "undefined") {
          sessionStorage.setItem("auth_failed", "true");
          window.location.replace("/login?expired=true");
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;