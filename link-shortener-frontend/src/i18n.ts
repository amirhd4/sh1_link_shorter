import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // فایلهای ترجمه را از سرور بارگذاری می‌کند [cite: 468]
  .use(LanguageDetector) // زبان کاربر را تشخیص می‌دهد [cite: 469]
  .use(initReactI18next) // i18n را به react-i18next متصل می‌کند [cite: 469]
  .init({
    supportedLngs: ['fa', 'en'],
    fallbackLng: 'fa', // زبان جایگزین در صورت عدم وجود ترجمه [cite: 472]
    lng: 'fa', // زبان پیش‌فرض [cite: 473]
    // debug: process.env.NODE_ENV === 'development',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // React به طور پیش‌فرض از XSS جلوگیری می‌کند [cite: 477]
    },
    backend: {
      // loadPath: '/locales/{{lng}}/{{ns}}.json',
        loadPath: '/locales/{{lng}}/common.json',
    },
  });

export default i18n;