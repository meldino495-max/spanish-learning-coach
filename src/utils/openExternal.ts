/**
 * 打开外部链接
 * Electron 桌面版：系统默认浏览器
 * 开发网页模式：新标签页
 */

export type OpenExternalResult = 'electron' | 'anchor' | 'window-open' | 'failed';

function openViaAnchor(url: string): boolean {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch {
    return false;
  }
}

export function isElectronApp(): boolean {
  return Boolean(window.electronAPI?.isElectron);
}

export function openExternalUrl(url: string): OpenExternalResult {
  if (!url) return 'failed';

  if (window.electronAPI?.openExternal) {
    window.electronAPI.openExternal(url);
    return 'electron';
  }

  if (openViaAnchor(url)) return 'anchor';

  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  if (opened) return 'window-open';

  return 'failed';
}

/** @deprecated 使用 openExternalUrl */
export const openInChrome = openExternalUrl;
