import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ru }from './lang/ru';
import { en } from './lang/en';
import { kz } from './lang/kz';

const LANGUAGE_KEY = 'app_language';

let initialized = false;

export const initI18n = async () => {
  if (initialized || i18n.isInitialized) return;

  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  const language = savedLanguage ?? 'ru';

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        ru: { translation: ru },
        en: { translation: en },
        kz: { translation: kz },
      },
      lng: language,
      fallbackLng: 'ru',
      interpolation: {
        escapeValue: false,
      },
    });

  initialized = true;
};

export const changeLanguage = async (lang: 'ru' | 'en' | 'kz') => {
    if ((i18n.language ?? 'ru') !== lang) {
        await i18n.changeLanguage(lang);
    }

    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
};

export default i18n;