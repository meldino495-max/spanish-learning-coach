import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';



import {

  getLanguage,

  LANGUAGE_LIST,

  type LanguageId,

  type LanguageInfo,

} from '../languages/registry';



import { getLanguagePack as loadPack } from '../data/languages';



import type { LanguagePack } from '../data/languages/packTypes';



import type { Curriculum } from '../types';



import { speakText } from '../utils/speech';

import { getAppSetting, isLanguageSetupComplete, setAppSetting } from '../utils/appSettings';







interface LanguageContextValue {



  languageId: LanguageId;



  language: LanguageInfo;



  pack: LanguagePack;



  curriculum: Curriculum;

  languageSetupComplete: boolean;



  setLanguageId: (id: LanguageId) => void;



  completeLanguageSetup: (id: LanguageId) => void;



  speak: (text: string, rate?: number) => void;



  languages: LanguageInfo[];



}







const LanguageContext = createContext<LanguageContextValue | null>(null);







function readStoredLanguage(): LanguageId | null {



  try {



    const raw = getAppSetting('language') as LanguageId | null;



    if (raw && LANGUAGE_LIST.some((l) => l.id === raw)) return raw;



  } catch {



    /* ignore */



  }



  return null;



}







export function LanguageProvider({ children }: { children: ReactNode }) {



  const [languageSetupComplete, setLanguageSetupComplete] = useState(isLanguageSetupComplete);



  const [languageId, setLanguageIdState] = useState<LanguageId>(() => {



    const stored = readStoredLanguage();



    if (stored) return stored;



    return 'es';



  });







  const persistLanguage = (id: LanguageId, markSetup = false) => {



    setLanguageIdState(id);



    setAppSetting('language', id);



    if (markSetup || !isLanguageSetupComplete()) {



      setAppSetting('languageChosen', '1');



      setLanguageSetupComplete(true);



    }



  };







  const setLanguageId = (id: LanguageId) => {



    persistLanguage(id, true);



  };







  const completeLanguageSetup = (id: LanguageId) => {



    persistLanguage(id, true);



  };







  const language = getLanguage(languageId);



  const pack = useMemo(() => loadPack(languageId), [languageId]);







  const value = useMemo<LanguageContextValue>(



    () => ({



      languageId,



      language,



      pack,



      curriculum: pack.curriculum,



      languageSetupComplete,



      setLanguageId,



      completeLanguageSetup,



      speak: (text, rate) => speakText(text, language.speechLang, rate),



      languages: LANGUAGE_LIST,



    }),



    [languageId, language, pack, languageSetupComplete],



  );







  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;



}







export function useLanguage() {



  const ctx = useContext(LanguageContext);



  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');



  return ctx;



}







export type { LanguagePack };



