import axios from "axios";
import config from "@/config";

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true, // بسیار حیاتی برای ارسال و دریافت کوکی‌های HttpOnly
});

// پرچم برای جلوگیری از درخواست‌های رفرش همزمان
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve();
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // اگر خطایی از سمت سرور دریافت نشد یا اینترنت قطع بود، مستقیما رد شو
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const requestUrl = originalRequest.url || "";

    // ۱. بررسی حیاتی: اگر خود درخواست رفرش یا توکن با ۴۰1 یا هر خطایی مواجه شد، هرگز نباید دوباره رفرش کند!
    if (
      requestUrl.endsWith("/auth/refresh") ||
      requestUrl.endsWith("/auth/token") ||
      requestUrl.endsWith("/auth/verify-otp-login") ||
      requestUrl.endsWith("/auth/register-otp")
    ) {
      // اگر رفرش توکن نامعتبر یا منقضی شده بود، کلاینت را به لاگین هدایت کن
      if (requestUrl.endsWith("/auth/refresh") && status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }

    // ۲. پردازش خطای 401 برای بقیه درخواست‌ها
    if (status === 401 && !originalRequest._retry) {

      // اگر در حال حاضر یک درخواست رفرش در جریان است، بقیه درخواست‌ها را در صف نگه دار
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            originalRequest._retry = true; // جلوگیری از لوپ برای درخواست‌های صف
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ارسال درخواست به بک‌اِند برای تمدید کوکی‌ها
        await apiClient.post("/auth/refresh");

        isRefreshing = false;
        processQueue(null, "success");

        // تکرار درخواست اولیه که با شکست مواجه شده بود
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);

        // اگر فرآیند رفرش به هر دلیلی با شکست مواجه شد، سشن کاملاً منقضی شده است
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;