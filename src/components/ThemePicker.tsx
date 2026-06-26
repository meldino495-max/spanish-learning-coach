import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { THEME_GROUPS, type ThemeGroup, type ThemeId } from '../themes/themes';
import { CustomBackgroundSettings } from './CustomBackgroundSettings';

function triggerClass(group: ThemeGroup | undefined) {
  if (group === 'tech') return 'theme-picker-trigger-tech';
  if (group === 'comic') return 'theme-picker-trigger-comic';
  if (group === 'chiikawa') return 'theme-picker-trigger-chiikawa';
  return '';
}

function optionClass(group: ThemeGroup, active: boolean) {
  const base = ['theme-option'];
  if (active) base.push('active');
  if (group === 'tech') base.push('theme-option-tech');
  if (group === 'comic') base.push('theme-option-comic');
  if (group === 'chiikawa') base.push('theme-option-chiikawa');
  return base.join(' ');
}

export function ThemePicker() {
  const { themeId, setThemeId, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const current = themes.find((t) => t.id === themeId);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="theme-picker" ref={wrapRef}>
      <button
        type="button"
        className={`theme-picker-trigger ${triggerClass(current?.group)}`}
        onClick={() => setOpen((v) => !v)}
        title="切换主题"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="theme-picker-icon">{current?.icon ?? '🎨'}</span>
        <span className="theme-picker-label">{current?.label ?? '主题'}</span>
      </button>

      {open && (
        <div className="theme-picker-panel theme-picker-panel-scroll" role="listbox" aria-label="选择主题">
          {THEME_GROUPS.map((group) => {
            const groupThemes = themes.filter((t) => t.group === group.id);
            if (groupThemes.length === 0) return null;
            return (
              <div key={group.id} className="theme-picker-section">
                <p className="theme-picker-heading">{group.label}</p>
                <div className="theme-picker-grid">
                  {groupThemes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      role="option"
                      aria-selected={themeId === theme.id}
                      className={optionClass(theme.group, themeId === theme.id)}
                      data-theme-preview={theme.id}
                      onClick={() => {
                        setThemeId(theme.id as ThemeId);
                        setOpen(false);
                      }}
                    >
                      <span className="theme-option-text">
                        <strong>
                          {theme.icon} {theme.label}
                        </strong>
                        <small>{theme.description}</small>
                      </span>
                      {themeId === theme.id && <span className="theme-option-check">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="theme-picker-section theme-picker-custom-bg">
            <CustomBackgroundSettings />
          </div>
          {window.electronAPI?.openLogs && (
            <div className="theme-picker-section theme-picker-logs">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => window.electronAPI?.openLogs?.()}
              >
                📄 查看运行日志
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
