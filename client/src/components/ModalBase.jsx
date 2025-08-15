// client/src/components/ModalBase.jsx
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function ModalBase({ children, onClose }) {
  const ref = useRef(null);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Focus trap & ESC
  useEffect(() => {
    const el = ref.current;
    const focusable = el?.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])') || [];
    const first = focusable[0], last = focusable[focusable.length - 1];
    first?.focus?.();

    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Tab' && focusable.length) {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        ref={ref}
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
