'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';

export default function FloatingTooltip() {
  const id = useId();
  const pathname = usePathname();
  const bubbleRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    let anchor = null;
    let timer;
    setTooltip(null);

    function hide() {
      clearTimeout(timer);
      anchor = null;
      setTooltip(null);
    }

    function show(event) {
      if (event.pointerType === 'touch') return;
      const target = event.target.closest?.('[data-tooltip]');
      if (!target?.dataset.tooltip || target === anchor) return;
      hide();
      anchor = target;
      timer = setTimeout(() => {
        if (target.isConnected) setTooltip({ target, text: target.dataset.tooltip });
      }, 250);
    }

    function leave(event) {
      if (anchor?.contains(event.target) && !anchor.contains(event.relatedTarget)) hide();
    }

    function escape(event) {
      if (event.key === 'Escape') hide();
    }

    document.addEventListener('pointerover', show);
    document.addEventListener('pointerout', leave);
    document.addEventListener('focusin', show);
    document.addEventListener('focusout', leave);
    document.addEventListener('pointerdown', hide);
    document.addEventListener('keydown', escape);
    document.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerover', show);
      document.removeEventListener('pointerout', leave);
      document.removeEventListener('focusin', show);
      document.removeEventListener('focusout', leave);
      document.removeEventListener('pointerdown', hide);
      document.removeEventListener('keydown', escape);
      document.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [pathname]);

  useLayoutEffect(() => {
    if (!tooltip) return;
    const { target } = tooltip;
    const bubble = bubbleRef.current;
    const rect = target.getBoundingClientRect();
    const { width, height } = bubble.getBoundingClientRect();
    const gap = 8;
    const above = rect.top - height - gap;
    const below = rect.bottom + gap;
    const x = Math.max(gap, Math.min(rect.left + (rect.width - width) / 2, window.innerWidth - width - gap));
    const y = above >= gap ? above : Math.max(gap, Math.min(below, window.innerHeight - height - gap));
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;

    const describedBy = target.getAttribute('aria-describedby');
    target.setAttribute('aria-describedby', [describedBy, id].filter(Boolean).join(' '));
    return () => {
      if (describedBy) target.setAttribute('aria-describedby', describedBy);
      else target.removeAttribute('aria-describedby');
    };
  }, [id, tooltip]);

  if (!tooltip) return null;
  return createPortal(
    <div ref={bubbleRef} id={id} role="tooltip"
      className="no-print pointer-events-none fixed left-0 top-0 z-[100] max-w-[min(16rem,calc(100vw-1rem))] rounded-lg bg-slate-900 px-2.5 py-1.5 text-center text-[11px] font-semibold leading-snug text-white shadow-lg">
      {tooltip.text}
    </div>,
    document.body
  );
}
