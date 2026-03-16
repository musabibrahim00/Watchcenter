import React from "react";
import { ResponsiveContainer } from "recharts";

/**
 * A wrapper around recharts ResponsiveContainer that defers rendering
 * until the parent container has positive dimensions. This prevents
 * the "width(0) and height(0)" warning that occurs when ResponsiveContainer
 * tries to measure a container that hasn't been laid out yet (common in
 * flex/grid layouts, tabs, animated panels, etc.).
 */
export function DeferredChart({
  children,
  width = "100%",
  height = "100%",
  minWidth = 0,
}: {
  children: React.ReactNode;
  width?: string | number;
  height?: string | number;
  minWidth?: number;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check immediately
    const { offsetWidth, offsetHeight } = el;
    if (offsetWidth > 0 && offsetHeight > 0) {
      setReady(true);
      return;
    }

    // If not ready yet, observe for size changes
    if (typeof ResizeObserver !== "undefined") {
      const obs = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: w, height: h } = entry.contentRect;
          if (w > 0 && h > 0) {
            setReady(true);
            obs.disconnect();
            break;
          }
        }
      });
      obs.observe(el);
      return () => obs.disconnect();
    }

    // Fallback: use rAF
    let raf: number;
    const check = () => {
      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        setReady(true);
      } else {
        raf = requestAnimationFrame(check);
      }
    };
    raf = requestAnimationFrame(check);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {ready && (
        <ResponsiveContainer width={width} height={height} minWidth={minWidth}>
          {children as React.ReactElement}
        </ResponsiveContainer>
      )}
    </div>
  );
}
