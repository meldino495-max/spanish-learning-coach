/**
 * 跨会话持久化设置：Electron 写入磁盘，浏览器回退 localStorage。
 * 解决 Vite 端口变化导致 localStorage 按 origin 丢失的问题。
 */

const KEYS = {
  language: 'coach-language-v1',
  languageChosen: 'coach-language-chosen-v1',
  audioInput: 'coach-audio-input-v1',
  audioOutput: 'coach-audio-output-v1',
  openaiKey: 'coach-openai-key-v1',
  openaiModel: 'coach-openai-model-v1',
  openaiBaseUrl: 'coach-openai-base-url-v1',
  aiConfig: 'coach-ai-config-v1',
  azureKey: 'coach-azure-key-v1',
  azureRegion: 'coach-azure-region-v1',
  pronMode: 'coach-pron-mode-v1',
  reminderEnabled: 'coach-reminder-enabled-v1',
  reminderTime: 'coach-reminder-time-v1',
  reminderLastNotified: 'coach-reminder-last-v1',
} as const;

type SettingKey = keyof typeof KEYS;

function storageKey(key: SettingKey): string {
  return KEYS[key];
}

function readLocal(key: SettingKey): string | null {
  try {
    return localStorage.getItem(storageKey(key));
  } catch {
    return null;
  }
}

function writeLocal(key: SettingKey, value: string) {
  try {
    localStorage.setItem(storageKey(key), value);
  } catch {
    /* ignore */
  }
}

export function getAppSetting(key: SettingKey): string | null {
  const fromDisk = window.electronAPI?.getSetting?.(storageKey(key));
  if (fromDisk != null && fromDisk !== '') return fromDisk;
  return readLocal(key);
}

export function setAppSetting(key: SettingKey, value: string) {
  writeLocal(key, value);
  window.electronAPI?.setSetting?.(storageKey(key), value);
}

export function isLanguageSetupComplete(): boolean {
  if (getAppSetting('languageChosen') === '1') return true;
  const lang = getAppSetting('language');
  return lang != null && lang !== '';
}

export { KEYS as APP_SETTING_KEYS };
