/**
 * Graph Rendering Performance Utilities
 * ======================================
 *
 * Shared hooks and helpers for high-performance graph rendering:
 *
 *  1. useThrottledRAF — throttle high-frequency updates (pan, zoom, drag)
 *     to a single requestAnimationFrame per frame.
 *  2. useStablePositions — memoize layout positions with structural equality
 *     so reference identity only changes when the graph truly changes.
 *  3. useViewportCull — cull nodes outside the visible SVG viewport.
 *  4. isInViewport — pure function for viewport hit-testing.
 */

import { useRef, useCallback, useMemo, useState } from "react";

/* ═══════════════════════════════════════════════════════════
   1. useThrottledRAF
   ═══════════════════════════════════════════════════════════ */

/**
 * Returns a throttled version of the given callback that will fire at most
 * once per animation frame. Great for mousemove / wheel / pointermove.
 */
export function useThrottledRAF<T extends (...args: any[]) => void>(fn: T): T {
  const rafId = useRef<number>(0);
  const latestArgs = useRef<any[]>([]);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const throttled = useCallback((...args: any[]) => {
    latestArgs.current = args;
    if (rafId.current) return; // already scheduled
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0;
      fnRef.current(...latestArgs.current);
    });
  }, []) as unknown as T;

  return throttled;
}

/* ═══════════════════════════════════════════════════════════
   2. useStablePositions
   ═══════════════════════════════════════════════════════════ */

interface Point {
  x: number;
  y: number;
}

/**
 * Wraps a position-computation function so that the resulting Map reference
 * only changes when the *values* actually differ — not just when the
 * upstream dependency array changes identity.
 *
 * This prevents downstream React.memo nodes from re-rendering when the
 * layout hasn't actually moved.
 */
export function useStablePositions(
  compute: () => Map<string, Point>,
  deps: React.DependencyList,
): Map<string, Point> {
  const prevRef = useRef<Map<string, Point> | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => {
    const next = compute();
    if (prevRef.current && mapsAreEqual(prevRef.current, next)) {
      return prevRef.current; // same layout — keep old reference
    }
    prevRef.current = next;
    return next;
  }, deps);
}

function mapsAreEqual(a: Map<string, Point>, b: Map<string, Point>): boolean {
  if (a.size !== b.size) return false;
  for (const [key, av] of a) {
    const bv = b.get(key);
    if (!bv || av.x !== bv.x || av.y !== bv.y) return false;
  }
  return true;
}

/* ═══════════════════════════════════════════════════════════
   3. Viewport Culling
   ═══════════════════════════════════════════════════════════ */

export interface ViewportRect {
  /** Minimum x in graph-space */
  minX: number;
  /** Minimum y in graph-space */
  minY: number;
  /** Maximum x in graph-space */
  maxX: number;
  /** Maximum y in graph-space */
  maxY: number;
}

/**
 * Converts a screen-space viewport (0,0 → containerW, containerH) into
 * graph-space coordinates given the current pan + zoom transform.
 */
export function screenToGraphViewport(
  containerW: number,
  containerH: number,
  panX: number,
  panY: number,
  zoom: number,
  /** Extra margin in graph-space pixels to add around each edge. */
  margin = 100,
): ViewportRect {
  const minX = -panX / zoom - margin;
  const minY = -panY / zoom - margin;
  const maxX = (containerW - panX) / zoom + margin;
  const maxY = (containerH - panY) / zoom + margin;
  return { minX, minY, maxX, maxY };
}

/**
 * Returns true if a point (or a rectangle around a point) is inside
 * the viewport rectangle.
 */
export function isInViewport(
  x: number,
  y: number,
  viewport: ViewportRect,
  nodeHalfWidth = 60,
  nodeHalfHeight = 60,
): boolean {
  return (
    x + nodeHalfWidth >= viewport.minX &&
    x - nodeHalfWidth <= viewport.maxX &&
    y + nodeHalfHeight >= viewport.minY &&
    y - nodeHalfHeight <= viewport.maxY
  );
}

/**
 * Hook that filters a set of positioned items to only those inside the
 * current viewport. Intended for graphs with > 30 nodes.
 *
 * @param positions  Map of nodeId → {x, y}
 * @param viewport   Current viewport rect in graph-space
 * @param threshold  Skip culling if total nodes ≤ threshold (default 30)
 */
export function useViewportCull<T extends { id: string }>(
  items: T[],
  positions: Map<string, Point>,
  viewport: ViewportRect | null,
  threshold = 30,
): T[] {
  return useMemo(() => {
    if (!viewport || items.length <= threshold) return items;
    return items.filter((item) => {
      const pos = positions.get(item.id);
      if (!pos) return false;
      return isInViewport(pos.x, pos.y, viewport);
    });
  }, [items, positions, viewport, threshold]);
}

/* ═══════════════════════════════════════════════════════════
   4. Ref-based hover tracking (avoids setState rerenders)
   ═══════════════════════════════════════════════════════════ */

/**
 * Returns a ref-based hover tracker that mutates SVG element attributes
 * directly instead of triggering React rerenders.
 *
 * Usage: attach onPointerEnter/Leave to each <g> and let the tracker
 * imperatively toggle a CSS class or attribute.
 */
export function useRefHover() {
  const currentId = useRef<string | null>(null);
  const elementMap = useRef<Map<string, SVGGElement>>(new Map());

  const register = useCallback((id: string, el: SVGGElement | null) => {
    if (el) {
      elementMap.current.set(id, el);
    } else {
      elementMap.current.delete(id);
    }
  }, []);

  const setHovered = useCallback((id: string | null) => {
    const prev = currentId.current;
    if (prev === id) return;

    // Remove hover from previous
    if (prev) {
      const prevEl = elementMap.current.get(prev);
      if (prevEl) prevEl.setAttribute("data-hovered", "false");
    }

    // Add hover to new
    if (id) {
      const newEl = elementMap.current.get(id);
      if (newEl) newEl.setAttribute("data-hovered", "true");
    }

    currentId.current = id;
  }, []);

  return { currentId, register, setHovered };
}
