import { useLanguage } from '../context/LanguageContext';
import { useProgress } from './useProgress';
import { useSRS } from './useSRS';

export function useLanguageProgress() {
  const { language } = useLanguage();
  return useProgress(language.storagePrefix);
}

export function useLanguageSRS() {
  const { language } = useLanguage();
  return useSRS(language.storagePrefix);
}
