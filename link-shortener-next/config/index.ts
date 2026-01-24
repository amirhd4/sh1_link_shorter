const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
  backendBaseUrl: process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8000/api",
  backendBaseUrlOrigin: process.env.NEXT_PUBLIC_BACKEND_BASE_URL_ORIGIN || "http://localhost:8000",
  debug: process.env.NEXT_PUBLIC_DEBUG === "true" || false,
  captcha: process.env.NEXT_PUBLIC_CAPTCHA === "true" || false
};

export default config;
