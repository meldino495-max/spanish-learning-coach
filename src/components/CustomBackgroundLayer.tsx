import { useCustomBackground } from '../context/CustomBackgroundContext';

export function CustomBackgroundLayer() {
  const { enabled, imageUrl, float, opacity, hasImage, ready } = useCustomBackground();

  if (!ready || !enabled || !hasImage || !imageUrl) return null;

  return (
    <div className="custom-bg-layer" aria-hidden="true">
      <img
        className={`custom-bg-image ${float ? 'custom-bg-float' : ''}`}
        src={imageUrl}
        alt=""
        draggable={false}
        style={{ opacity }}
      />
    </div>
  );
}
