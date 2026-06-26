export type LanguageId = 'es' | 'fr' | 'sr' | 'uk' | 'ru';

export interface LanguageInfo {
  id: LanguageId;
  label: string;
  nativeName: string;
  flag: string;
  speechLang: string;
  /** localStorage 前缀 */
  storagePrefix: string;
}

export const LANGUAGES: Record<LanguageId, LanguageInfo> = {
  es: {
    id: 'es',
    label: '西班牙语',
    nativeName: 'Español',
    flag: '🇪🇸',
    speechLang: 'es-ES',
    storagePrefix: 'es-coach',
  },
  fr: {
    id: 'fr',
    label: '法语',
    nativeName: 'Français',
    flag: '🇫🇷',
    speechLang: 'fr-FR',
    storagePrefix: 'fr-coach',
  },
  sr: {
    id: 'sr',
    label: '塞尔维亚语',
    nativeName: 'Srpski',
    flag: '🇷🇸',
    speechLang: 'sr-RS',
    storagePrefix: 'sr-coach',
  },
  uk: {
    id: 'uk',
    label: '乌克兰语',
    nativeName: 'Українська',
    flag: '🇺🇦',
    speechLang: 'uk-UA',
    storagePrefix: 'uk-coach',
  },
  ru: {
    id: 'ru',
    label: '俄语',
    nativeName: 'Русский',
    flag: '🇷🇺',
    speechLang: 'ru-RU',
    storagePrefix: 'ru-coach',
  },
};

export const LANGUAGE_LIST: LanguageInfo[] = Object.values(LANGUAGES);

export function getLanguage(id: LanguageId): LanguageInfo {
  return LANGUAGES[id];
}

export const DEFAULT_LANGUAGE: LanguageId = 'es';
