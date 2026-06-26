import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import type { LanguageId } from '../languages/registry';
import { getAppSetting } from '../utils/appSettings';
import './LanguageWelcomeModal.css';

const LANGUAGE_HINTS: Record<LanguageId, string> = {
  es: 'A1→C2 完整路线 · 场景 & 17+ 行业',
  fr: 'A1→C2 · 法国生活场景 & 多行业',
  sr: 'A1→C2 · 拉丁/西里尔 · 巴尔干场景',
  uk: 'A1→C2 · 乌克兰西里尔 · 本地场景',
  ru: 'A1→C2 · 俄语西里尔 · 多场景行业',
};

export function LanguageWelcomeModal() {
  const { languages, completeLanguageSetup, languageSetupComplete } = useLanguage();
  const [selected, setSelected] = useState<LanguageId | null>(() => {
    const saved = getAppSetting('language') as LanguageId | null;
    if (saved && languages.some((l) => l.id === saved)) return saved;
    return null;
  });

  if (languageSetupComplete) return null;

  return (
    <div className="lang-welcome-overlay" role="dialog" aria-modal="true" aria-labelledby="lang-welcome-title">
      <div className="lang-welcome-panel">
        <div className="lang-welcome-header">
          <span className="lang-welcome-badge">🌍 多语言学习教练</span>
          <h2 id="lang-welcome-title">你想学哪门语言？</h2>
          <p className="lang-welcome-sub">
            首次使用请先选择学习语言。之后可在顶部随时切换；各语言进度独立保存。
          </p>
        </div>

        <div className="lang-welcome-grid">
          {languages.map((lang) => (
            <button
              key={lang.id}
              type="button"
              className={`lang-welcome-card ${selected === lang.id ? 'selected' : ''}`}
              onClick={() => setSelected(lang.id)}
              aria-pressed={selected === lang.id}
            >
              <span className="lang-welcome-flag">{lang.flag}</span>
              <span className="lang-welcome-name">{lang.label}</span>
              <span className="lang-welcome-native">{lang.nativeName}</span>
              <span className="lang-welcome-hint">{LANGUAGE_HINTS[lang.id]}</span>
              {selected === lang.id && <span className="lang-welcome-check">✓</span>}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-primary lang-welcome-start"
          disabled={!selected}
          onClick={() => selected && completeLanguageSetup(selected)}
        >
          {selected ? `开始学习 ${languages.find((l) => l.id === selected)?.label}` : '请先选择一门语言'}
        </button>
      </div>
    </div>
  );
}
