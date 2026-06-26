/** 每日学习提醒：本机定时，使用桌面通知（Chromium/Electron 原生）。 */
import { getAppSetting, setAppSetting } from './appSettings';

export interface ReminderConfig {
  enabled: boolean;
  time: string; // 'HH:MM'
}

export function getReminderConfig(): ReminderConfig {
  return {
    enabled: getAppSetting('reminderEnabled') === '1',
    time: getAppSetting('reminderTime') || '20:00',
  };
}

export function saveReminderConfig(cfg: Partial<ReminderConfig>) {
  if (cfg.enabled !== undefined) setAppSetting('reminderEnabled', cfg.enabled ? '1' : '0');
  if (cfg.time !== undefined) setAppSetting('reminderTime', cfg.time);
}

export function notifySupported(): boolean {
  return typeof Notification !== 'undefined';
}

export async function requestNotifyPermission(): Promise<boolean> {
  if (!notifySupported()) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const res = await Notification.requestPermission();
    return res === 'granted';
  } catch {
    return false;
  }
}

export function showReminder(title: string, body: string) {
  try {
    if (notifySupported() && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  } catch {
    /* ignore */
  }
}

/** 计算从现在到下一个 HH:MM 的毫秒数（今天已过则顺延到明天） */
export function msUntilNext(time: string): number {
  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return -1;
  const now = new Date();
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 今天是否已经提醒过 */
export function notifiedToday(): boolean {
  return getAppSetting('reminderLastNotified') === todayStr();
}

/** 标记今天已提醒 */
export function markNotifiedToday() {
  setAppSetting('reminderLastNotified', todayStr());
}

/** 今天设定时间是否已过（用于错过补提醒判断） */
export function isPastTimeToday(time: string): boolean {
  const [h, m] = time.split(':').map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const now = new Date();
  const t = new Date();
  t.setHours(h, m, 0, 0);
  return now.getTime() >= t.getTime();
}
