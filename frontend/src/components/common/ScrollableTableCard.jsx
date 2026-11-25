'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScrollableTableCard({ children, label, viewportClassName = '' }) {
  const topRef = useRef(null);
  const viewportRef = useRef(null);
  const [overflowWidth, setOverflowWidth] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const measure = () => setOverflowWidth(viewport.scrollWidth - viewport.clientWidth);
    const observer = new ResizeObserver(measure);

    observer.observe(viewport);
    if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (overflowWidth > 0) topRef.current.scrollLeft = viewportRef.current.scrollLeft;
  }, [overflowWidth]);

  const syncScroll = (event, target) => {
    const { scrollLeft } = event.currentTarget;
    if (target.scrollLeft !== scrollLeft) target.scrollLeft = scrollLeft;
  };

  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-2 sm:p-3">
      <div
        ref={topRef}
        hidden={overflowWidth <= 0}
        role="region"
        aria-label={`Gulir horizontal ${label}`}
        tabIndex={0}
        onScroll={event => syncScroll(event, viewportRef.current)}
        className="custom-scrollbar mb-2 overflow-x-auto"
      >
        <div aria-hidden="true" className="h-px" style={{ width: `calc(100% + ${overflowWidth}px)` }} />
      </div>
      <div
        ref={viewportRef}
        onScroll={event => {
          if (overflowWidth > 0) syncScroll(event, topRef.current);
        }}
        className={`custom-scrollbar overflow-x-auto ${viewportClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
