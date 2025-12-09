const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  backendBaseUrl: import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8000/api",
  backendBaseUrlOrigin: import.meta.env.VITE_BACKEND_BASE_URL_ORIGIN || "http://localhost:8000",
  debug: import.meta.env.VITE_DEBUG || false,

};

export default config;