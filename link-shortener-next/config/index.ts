const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",

  backendBaseUrl: process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:8000/api",

  backendBaseUrlOrigin: process.env.NEXT_PUBLIC_BACKEND_BASE_URL_ORIGIN || "http://localhost:8000",

  frontBaseUrl: process.env.NEXT_PUBLIC_FRONT_BASE_URL_ORIGIN || "http://localhost:3000",

  debug: process.env.NEXT_PUBLIC_DEBUG === "true",
  captcha: process.env.NEXT_PUBLIC_CAPTCHA === "true",

  eitaaSupport: process.env.NEXT_PUBLIC_EITAA_SUPPORT,
  rubikaSupport: process.env.NEXT_PUBLIC_RUBICA_SUPPORT,
  instagramPage: process.env.NEXT_PUBLIC_INSTAGRAM_PAGE,
  telegramChannel: process.env.NEXT_PUBLIC_TELEGRAM_PAGE,
};

if (typeof window !== "undefined" && config.debug) {
  console.log("API CONFIG:", {
    apiBaseUrl: config.apiBaseUrl,
    backendBaseUrl: config.backendBaseUrl,
    backendBaseUrlOrigin: config.backendBaseUrlOrigin,
  });
}

export default config;
