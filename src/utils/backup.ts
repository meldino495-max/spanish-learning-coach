/**
 * 学习数据导出 / 导入：进度、SRS 记忆库、活动记录、陪练历史、各项设置。
 * 数据全部存于 localStorage（键名均包含 "coach"）。Electron 下设置另存磁盘，导入时一并同步。
 */

const SENSITIVE = /(openai-key|azure-key|ai-config)/;

export interface BackupFile {
  app: 'multilang-coach';
  version: number;
  exportedAt: string;
  includeKeys: boolean;
  data: Record<string, string>;
}

function collectKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.includes('coach')) keys.push(k);
  }
  return keys;
}

/** 去掉 aiConfig 里的 apiKey，只保留 provider/model/baseUrl */
function sanitizeAiConfig(value: string): string {
  try {
    const obj = JSON.parse(value);
    if (obj && obj.entries && typeof obj.entries === 'object') {
      for (const id of Object.keys(obj.entries)) {
        if (obj.entries[id] && typeof obj.entries[id] === 'object') {
          delete obj.entries[id].apiKey;
        }
      }
    }
    return JSON.stringify(obj);
  } catch {
    return value;
  }
}

export function exportData(includeKeys: boolean): BackupFile {
  const data: Record<string, string> = {};
  for (const k of collectKeys()) {
    const v = localStorage.getItem(k);
    if (v == null) continue;
    if (!includeKeys && SENSITIVE.test(k)) {
      if (k.includes('ai-config')) {
        data[k] = sanitizeAiConfig(v); // 保留偏好但抹掉 key
      }
      continue; // 跳过纯 key 项
    }
    data[k] = v;
  }
  return {
    app: 'multilang-coach',
    version: 1,
    exportedAt: new Date().toISOString(),
    includeKeys,
    data,
  };
}

export function downloadBackup(includeKeys: boolean) {
  const payload = exportData(includeKeys);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `语言教练备份-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface ImportResult {
  imported: number;
  exportedAt?: string;
}

export function importData(json: string, mode: 'merge' | 'replace'): ImportResult {
  const parsed = JSON.parse(json) as Partial<BackupFile>;
  if (!parsed || parsed.app !== 'multilang-coach' || !parsed.data || typeof parsed.data !== 'object') {
    throw new Error('文件格式不正确，不是本应用的备份文件。');
  }

  if (mode === 'replace') {
    for (const k of collectKeys()) localStorage.removeItem(k);
  }

  let imported = 0;
  for (const [k, v] of Object.entries(parsed.data)) {
    if (!k.includes('coach') || typeof v !== 'string') continue;
    try {
      localStorage.setItem(k, v);
      // Electron：把设置类（coach-* 顶层键）同步到磁盘
      if (k.startsWith('coach-')) window.electronAPI?.setSetting?.(k, v);
      imported++;
    } catch {
      /* ignore single key */
    }
  }
  return { imported, exportedAt: parsed.exportedAt };
}
