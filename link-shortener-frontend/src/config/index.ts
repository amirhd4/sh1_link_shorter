const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  backendBaseUrl: import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8000",
  backendBaseUrlOrigin: import.meta.env.VITE_BACKEND_BASE_URL_ORIGIN || "http://localhost:8000",
};

export default config;