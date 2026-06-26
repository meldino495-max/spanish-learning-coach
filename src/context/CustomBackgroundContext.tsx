import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  clearCustomBackground,
  isAllowedBackgroundFile,
  loadCustomBackground,
  saveCustomBackground,
  updateCustomBackgroundMeta,
  CUSTOM_BG_MAX_BYTES,
  type CustomBgMeta,
} from '../utils/customBackgroundStore';

interface CustomBackgroundContextValue {
  imageUrl: string | null;
  fileName: string | null;
  isGif: boolean;
  enabled: boolean;
  float: boolean;
  opacity: number;
  hasImage: boolean;
  ready: boolean;
  setEnabled: (v: boolean) => void;
  setFloat: (v: boolean) => void;
  setOpacity: (v: number) => void;
  uploadFile: (file: File) => Promise<string | null>;
  clearBackground: () => Promise<void>;
}

const CustomBackgroundContext = createContext<CustomBackgroundContextValue | null>(null);

const DEFAULT_META: CustomBgMeta = {
  enabled: false,
  float: true,
  opacity: 0.42,
  mimeType: '',
  fileName: '',
};

export function CustomBackgroundProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<CustomBgMeta>(DEFAULT_META);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const urlRef = useRef<string | null>(null);

  const revokeUrl = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setImageUrl(null);
  }, []);

  const applyBlob = useCallback(
    (blob: Blob, nextMeta: CustomBgMeta) => {
      revokeUrl();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setImageUrl(url);
      setMeta(nextMeta);
    },
    [revokeUrl],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const data = await loadCustomBackground();
      if (cancelled) return;
      if (data) {
        applyBlob(data.blob, data.meta);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [applyBlob]);

  useEffect(() => () => revokeUrl(), [revokeUrl]);

  const persistMeta = useCallback(async (patch: Partial<CustomBgMeta>) => {
    setMeta((prev) => {
      const next = { ...prev, ...patch };
      void updateCustomBackgroundMeta(patch);
      return next;
    });
  }, []);

  const setEnabled = useCallback(
    (v: boolean) => void persistMeta({ enabled: v }),
    [persistMeta],
  );

  const setFloat = useCallback(
    (v: boolean) => void persistMeta({ float: v }),
    [persistMeta],
  );

  const setOpacity = useCallback(
    (v: number) => void persistMeta({ opacity: Math.min(1, Math.max(0.1, v)) }),
    [persistMeta],
  );

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      if (!isAllowedBackgroundFile(file)) {
        return '仅支持 PNG、JPG、WebP、GIF、BMP、SVG 图片';
      }
      if (file.size > CUSTOM_BG_MAX_BYTES) {
        return '文件过大，请使用小于 20MB 的图片（GIF 建议压缩后上传）';
      }
      const nextMeta: CustomBgMeta = {
        enabled: true,
        float: meta.float,
        opacity: meta.opacity,
        mimeType: file.type || 'image/gif',
        fileName: file.name,
      };
      await saveCustomBackground(file, nextMeta);
      applyBlob(file, nextMeta);
      return null;
    },
    [applyBlob, meta.float, meta.opacity],
  );

  const clearBackground = useCallback(async () => {
    await clearCustomBackground();
    revokeUrl();
    setMeta(DEFAULT_META);
  }, [revokeUrl]);

  const value = useMemo<CustomBackgroundContextValue>(
    () => ({
      imageUrl,
      fileName: meta.fileName || null,
      isGif: meta.mimeType === 'image/gif' || /\.gif$/i.test(meta.fileName),
      enabled: meta.enabled,
      float: meta.float,
      opacity: meta.opacity,
      hasImage: imageUrl != null,
      ready,
      setEnabled,
      setFloat,
      setOpacity,
      uploadFile,
      clearBackground,
    }),
    [
      imageUrl,
      meta,
      ready,
      setEnabled,
      setFloat,
      setOpacity,
      uploadFile,
      clearBackground,
    ],
  );

  return (
    <CustomBackgroundContext.Provider value={value}>{children}</CustomBackgroundContext.Provider>
  );
}

export function useCustomBackground() {
  const ctx = useContext(CustomBackgroundContext);
  if (!ctx) throw new Error('useCustomBackground must be used within CustomBackgroundProvider');
  return ctx;
}
