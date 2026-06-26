export interface ElectronAPI {

  isElectron: boolean;

  openExternal: (url: string) => void;

  openSoundSettings: () => void;

  getSetting: (key: string) => string | null;

  setSetting: (key: string, value: string) => void;

  openLogs?: () => void;

  openaiChat?: (args: {
    baseUrl: string;
    apiKey: string;
    payload: unknown;
  }) => Promise<{ ok: boolean; content?: string; error?: string }>;

  openaiChatStream?: (
    args: { baseUrl: string; apiKey: string; payload: unknown },
    onDelta: (delta: string) => void,
  ) => Promise<{ ok: boolean; content?: string; error?: string }>;

  azurePron?: (args: {
    region: string;
    key: string;
    language: string;
    assessment: string;
    audioBase64: string;
  }) => Promise<{ ok: boolean; body?: string; error?: string }>;

}



declare global {

  interface Window {

    electronAPI?: ElectronAPI;

  }

}



export {};

