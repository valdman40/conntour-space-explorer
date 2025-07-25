import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from './locales/en.json';
import heTranslations from './locales/he.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  he: {
    translation: heTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    // Add callback to handle RTL changes
    react: {
      useSuspense: false,
    },
  });

// Handle RTL direction changes
i18n.on('languageChanged', (lng) => {
  document.dir = lng === 'he' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

export default i18n;
