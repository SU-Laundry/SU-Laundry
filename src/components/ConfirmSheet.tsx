import { useEffect, useRef, type ReactNode } from 'react';

/** 하단 확인 시트 — 실수로 누르는 것을 막기 위한 한 번 더 확인 */
export function ConfirmSheet({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel = '취소',
  busy = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sheet-backdrop" onClick={busy ? undefined : onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onClick={(e) => e.stopPropagation()}>
        <span className="sheet__handle" aria-hidden />
        <h2 id="sheet-title" style={{ fontSize: 'var(--fs-section)', fontWeight: 700 }}>
          {title}
        </h2>
        {children && <div className="caption" style={{ marginTop: 'var(--space-2)', lineHeight: 1.55 }}>{children}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
          <button className="btn btn-tertiary" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </button>
          <button ref={confirmRef} className="btn btn-primary" onClick={onConfirm} disabled={busy}>
            {busy ? '보내는 중…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
