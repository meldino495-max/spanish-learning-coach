import { useEffect, useRef, useState } from 'react';

export interface TopbarMenuItem {
  icon: string;
  label: string;
  desc?: string;
  badge?: string | number;
  onClick: () => void;
}

/** 顶栏下拉菜单：把同类功能收进一个按钮，减少顶栏杂乱，功能一个不少。 */
export function TopbarMenu({
  icon,
  label,
  items,
  highlight,
}: {
  icon: string;
  label: string;
  items: TopbarMenuItem[];
  highlight?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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
    <div className="topbar-menu" ref={ref}>
      <button
        type="button"
        className={`topbar-menu-trigger ${highlight ? 'topbar-menu-trigger-accent' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span aria-hidden="true">{icon}</span>
        <span className="topbar-menu-label">{label}</span>
        <span className="topbar-menu-caret" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="topbar-menu-panel" role="menu">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              className="topbar-menu-item"
              onClick={() => {
                it.onClick();
                setOpen(false);
              }}
            >
              <span className="topbar-menu-item-icon" aria-hidden="true">
                {it.icon}
              </span>
              <span className="topbar-menu-item-text">
                <strong>
                  {it.label}
                  {it.badge ? <em className="topbar-menu-badge">{it.badge}</em> : null}
                </strong>
                {it.desc && <small>{it.desc}</small>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
