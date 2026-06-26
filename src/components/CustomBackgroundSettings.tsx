import { useRef, useState } from 'react';
import { useCustomBackground } from '../context/CustomBackgroundContext';
import { CUSTOM_BG_ACCEPT } from '../utils/customBackgroundStore';

export function CustomBackgroundSettings() {
  const {
    imageUrl,
    fileName,
    isGif,
    enabled,
    float,
    opacity,
    hasImage,
    ready,
    setEnabled,
    setFloat,
    setOpacity,
    uploadFile,
    clearBackground,
  } = useCustomBackground();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onPickFile = () => {
    setError(null);
    inputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    const err = await uploadFile(file);
    setUploading(false);
    if (err) setError(err);
  };

  const onClear = async () => {
    setError(null);
    await clearBackground();
  };

  if (!ready) {
    return (
      <div className="custom-bg-settings">
        <p className="custom-bg-loading">正在加载背景设置…</p>
      </div>
    );
  }

  return (
    <div className="custom-bg-settings">
      <p className="theme-picker-heading">🖼️ 自定义背景</p>
      <p className="custom-bg-hint">支持 PNG、JPG、WebP、GIF（动图）、BMP、SVG，最大 20MB</p>

      <input
        ref={inputRef}
        type="file"
        accept={CUSTOM_BG_ACCEPT}
        className="custom-bg-file-input"
        onChange={(e) => void onFileChange(e)}
      />

      {hasImage && imageUrl && (
        <div className="custom-bg-preview-wrap">
          <img src={imageUrl} alt="" className="custom-bg-preview" />
          <span className="custom-bg-preview-meta">
            {fileName}
            {isGif ? ' · GIF 动图' : ''}
          </span>
        </div>
      )}

      <div className="custom-bg-actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onPickFile}
          disabled={uploading}
        >
          {hasImage ? '更换图片' : '选择图片 / GIF'}
        </button>
        {hasImage && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => void onClear()}>
            清除
          </button>
        )}
      </div>

      {error && <p className="custom-bg-error">{error}</p>}

      <label className="custom-bg-toggle">
        <input
          type="checkbox"
          checked={enabled}
          disabled={!hasImage}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        <span>使用自定义背景</span>
      </label>

      <label className="custom-bg-toggle">
        <input
          type="checkbox"
          checked={float}
          disabled={!hasImage || !enabled}
          onChange={(e) => setFloat(e.target.checked)}
        />
        <span>轻微浮动动画</span>
      </label>

      <label className="custom-bg-field">
        <span>背景透明度 · {Math.round(opacity * 100)}%</span>
        <input
          type="range"
          min={10}
          max={90}
          step={5}
          value={Math.round(opacity * 100)}
          disabled={!hasImage || !enabled}
          onChange={(e) => setOpacity(Number(e.target.value) / 100)}
        />
      </label>

      {enabled && hasImage && (
        <p className="custom-bg-note">
          已启用自定义背景，吉伊卡哇主题插画将暂时隐藏。
        </p>
      )}
    </div>
  );
}
