import type { PathNode, PathEdge, LayoutResult } from "./types";

/* ================================================================
   GRAPH CANVAS — constants & layout engine
   ================================================================ */

export const GRID_SIZE = 30;
export const NODE_W = 108;
export const NODE_H = 68;
export const VULN_NODE_W = 210;
export const VULN_NODE_H = 188;
export const VULN_KEV_H = 26; /* KEV badge height above card */
export const VULN_KEV_GAP = 8;
export const H_SPACING = 200;
export const V_PAIR_SPACING = 120;
export const MIN_ZOOM = 0.6;
export const MAX_ZOOM = 2.0;
export const FIT_PADDING = 48;
export const FIT_ZOOM_MIN = 0.8;
export const FIT_ZOOM_MAX = 1.0;
export const ZOOM_STEP_BUTTON = 0.2;
export const ZOOM_SENSITIVITY = 0.0012;
export const PAN_MARGIN_RATIO = 0.25;

/* Blast radius pill (compact trigger to the right of vuln card) */
export const BR_PILL_W = 136;
export const BR_PILL_H = 40;
export const BR_PILL_GAP_X = 28;

/* Vuln info card dimensions (used for attack chain overlay below card) */
export const VULN_CARD_W = VULN_NODE_W;
export const VULN_CARD_H = VULN_NODE_H;
export const VULN_CARD_GAP_Y = 14;
export const VULN_CARD_ARROW_H = 32;

/* Attack chain overlay dimensions */
export const CHAIN_STEP_H = 36;
export const CHAIN_CONNECTOR_H = 20;
export const CHAIN_PAD = 10;
export const CHAIN_HEADER_H = 30;
export const CHAIN_W = 170;
export const CHAIN_GAP_Y = 14;

/* Blast radius panel dimensions */
export const BR_W = 660;
export const BR_GAP_X = 24;
export const BR_CARD_MIN = 140;
export const BR_CARD_H = 92;
export const BR_COLS = 4;
export const BR_GRID_GAP = 8;
export const BR_HEADER_H = 44;
export const BR_SUMMARY_H = 78;
export const BR_PANEL_PAD = 14;

export function computeGraphLayout(
  nodes: PathNode[],
  edges: PathEdge[],
): LayoutResult {
  if (nodes.length === 0) {
    return { positions: new Map(), bbox: { minX: 0, minY: 0, maxX: 0, maxY: 0, w: 0, h: 0 } };
  }

  /* --- BFS layering (longest-path) --- */
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  for (const n of nodes) { outgoing.set(n.id, []); incoming.set(n.id, []); }
  for (const e of edges) { outgoing.get(e.from)?.push(e.to); incoming.get(e.to)?.push(e.from); }

  const layer = new Map<string, number>();
  const roots = nodes.filter((n) => (incoming.get(n.id)?.length || 0) === 0);
  if (roots.length === 0) roots.push(nodes[0]);
  const queue: string[] = roots.map((r) => r.id);
  for (const r of roots) layer.set(r.id, 0);

  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    const curLayer = layer.get(cur) || 0;
    for (const next of outgoing.get(cur) || []) {
      const prev = layer.get(next);
      if (prev === undefined || curLayer + 1 > prev) {
        layer.set(next, curLayer + 1);
        queue.push(next);
      }
    }
  }

  const layerGroups = new Map<number, PathNode[]>();
  let maxLayer = 0;
  for (const n of nodes) {
    const l = layer.get(n.id) ?? 0;
    maxLayer = Math.max(maxLayer, l);
    if (!layerGroups.has(l)) layerGroups.set(l, []);
    layerGroups.get(l)!.push(n);
  }

  /* --- Find the vulnerable node to center graph on --- */
  let vulnLayer = -1;
  for (const n of nodes) {
    if (n.isVulnerable) { vulnLayer = layer.get(n.id) ?? -1; break; }
  }
  // If no vulnerable node, center on the middle layer
  if (vulnLayer < 0) vulnLayer = Math.floor(maxLayer / 2);

  /* --- Position nodes with even H_SPACING, centered on the vuln column --- */
  const positions = new Map<string, { x: number; y: number }>();

  for (let l = 0; l <= maxLayer; l++) {
    const group = layerGroups.get(l) || [];
    const count = group.length;
    // Column x: centered so vulnLayer maps to x=0
    const colCenterX = (l - vulnLayer) * H_SPACING;

    if (count === 1) {
      // Single node: vertically centered at y=0
      const nw = group[0].isVulnerable ? VULN_NODE_W : NODE_W;
      const nh = group[0].isVulnerable ? VULN_NODE_H : NODE_H;
      positions.set(group[0].id, {
        x: colCenterX - nw / 2,
        y: -nh / 2,
      });
    } else {
      // Multiple nodes in same layer: stack vertically as pairs
      const totalGroupH = (count - 1) * V_PAIR_SPACING;
      for (let i = 0; i < count; i++) {
        const nw = group[i].isVulnerable ? VULN_NODE_W : NODE_W;
        const nh = group[i].isVulnerable ? VULN_NODE_H : NODE_H;
        positions.set(group[i].id, {
          x: colCenterX - nw / 2,
          y: -totalGroupH / 2 + i * V_PAIR_SPACING - nh / 2,
        });
      }
    }
  }

  /* --- Compute bounding box --- */
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [id, pos] of positions) {
    const node = nodes.find((n) => n.id === id);
    const nw = node?.isVulnerable ? VULN_NODE_W : NODE_W;
    const nh = node?.isVulnerable ? VULN_NODE_H : NODE_H;
    const topExtra = node?.isVulnerable ? (VULN_KEV_H + VULN_KEV_GAP) : 0;
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y - topExtra);
    maxX = Math.max(maxX, pos.x + nw);
    maxY = Math.max(maxY, pos.y + nh);
  }

  return { positions, bbox: { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY } };
}

export function computeFitView(
  bbox: LayoutResult["bbox"],
  canvasW: number,
  canvasH: number,
): { zoom: number; panX: number; panY: number } {
  if (bbox.w === 0 || bbox.h === 0 || canvasW < 1 || canvasH < 1) {
    return { zoom: 1, panX: canvasW / 2, panY: canvasH / 2 };
  }
  const padW = bbox.w + FIT_PADDING * 2;
  const padH = bbox.h + FIT_PADDING * 2;
  const rawZoom = Math.min(canvasW / padW, canvasH / padH);
  const fitZoom = Math.max(FIT_ZOOM_MIN, Math.min(rawZoom, FIT_ZOOM_MAX));
  const cx = bbox.minX + bbox.w / 2;
  const cy = bbox.minY + bbox.h / 2;
  return { zoom: fitZoom, panX: canvasW / 2 - cx * fitZoom, panY: canvasH / 2 - cy * fitZoom };
}

/**
 * Clamp pan so the graph bbox (in screen coords) cannot be dragged
 * entirely off the visible canvas. Allows PAN_MARGIN_RATIO overshoot
 * on each side so the user still has comfortable breathing room.
 */
export function clampPan(
  px: number,
  py: number,
  z: number,
  bbox: LayoutResult["bbox"],
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  if (bbox.w === 0 || bbox.h === 0 || canvasW < 1 || canvasH < 1) return { x: px, y: py };

  const scaledW = bbox.w * z;
  const scaledH = bbox.h * z;
  const marginX = Math.max(scaledW * PAN_MARGIN_RATIO, 60);
  const marginY = Math.max(scaledH * PAN_MARGIN_RATIO, 60);

  // Screen-x of graph right edge = bbox.maxX * z + panX  ≥  -marginX
  // Screen-x of graph left  edge = bbox.minX * z + panX  ≤  canvasW + marginX
  const minPanX = -bbox.maxX * z - marginX;
  const maxPanX = canvasW + marginX - bbox.minX * z;
  const minPanY = -bbox.maxY * z - marginY;
  const maxPanY = canvasH + marginY - bbox.minY * z;

  return {
    x: Math.max(minPanX, Math.min(px, maxPanX)),
    y: Math.max(minPanY, Math.min(py, maxPanY)),
  };
}

/* ================================================================
   ATTACK CHAIN — derive longest root→target path
   ================================================================ */

export interface ChainStep {
  nodeId: string;
  label: string;
  icon: PathNode["icon"];
  isVulnerable: boolean;
  cve: string | undefined;
}

export function computeAttackChainToNode(
  targetId: string,
  nodes: PathNode[],
  edges: PathEdge[],
): ChainStep[] {
  if (nodes.length === 0) return [];
  const incoming = new Map<string, string[]>();
  for (const n of nodes) incoming.set(n.id, []);
  for (const e of edges) incoming.get(e.to)?.push(e.from);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  let bestPath: string[] = [];

  function dfs(nodeId: string, path: string[], visited: Set<string>) {
    path.push(nodeId);
    visited.add(nodeId);
    const preds = incoming.get(nodeId) || [];
    if (preds.length === 0 || preds.every((p) => visited.has(p))) {
      if (path.length > bestPath.length) bestPath = [...path];
    } else {
      for (const pred of preds) {
        if (!visited.has(pred)) dfs(pred, path, visited);
      }
    }
    path.pop();
    visited.delete(nodeId);
  }

  dfs(targetId, [], new Set());
  bestPath.reverse();

  return bestPath
    .map((id) => {
      const n = nodeMap.get(id);
      if (!n) return null;
      return { nodeId: n.id, label: n.label, icon: n.icon, isVulnerable: !!n.isVulnerable, cve: n.cve };
    })
    .filter((s): s is ChainStep => !!s);
}

export function computeChainPanelHeight(stepCount: number): number {
  const totalSteps = stepCount + 1;
  const totalConnectors = totalSteps - 1;
  return CHAIN_HEADER_H + CHAIN_PAD + totalSteps * CHAIN_STEP_H + totalConnectors * CHAIN_CONNECTOR_H + CHAIN_PAD;
}

export function computeBRPanelHeight(assetCount: number): number {
  const rows = Math.ceil(assetCount / BR_COLS);
  const gridH = rows * BR_CARD_H + Math.max(0, rows - 1) * BR_GRID_GAP;
  return BR_HEADER_H + BR_SUMMARY_H + gridH + BR_PANEL_PAD * 3;
}

/* ================================================================
   EXPLOIT FLOW — compute primary attack path edge sequence
   ================================================================ */

export function computeExploitFlow(nodes: PathNode[], edges: PathEdge[]): PathEdge[] {
  const entryNode = nodes.find((n) => n.icon === "internet") || nodes[0];
  const vulnNode = nodes.find((n) => n.isVulnerable);
  if (!entryNode || !vulnNode) return [];

  const adj: Record<string, string[]> = {};
  edges.forEach((e) => {
    if (!adj[e.from]) adj[e.from] = [];
    adj[e.from].push(e.to);
  });

  /* BFS: entry → vulnNode */
  const parent: Record<string, string | null> = {};
  parent[entryNode.id] = null;
  const bfsQueue = [entryNode.id];
  let head = 0;
  while (head < bfsQueue.length) {
    const c = bfsQueue[head++];
    if (c === vulnNode.id) break;
    for (const next of adj[c] || []) {
      if (!(next in parent)) {
        parent[next] = c;
        bfsQueue.push(next);
      }
    }
  }

  const pathEdges: PathEdge[] = [];
  let cur: string | null = vulnNode.id;
  while (cur !== null && parent[cur] !== undefined && parent[cur] !== null) {
    pathEdges.unshift({ from: parent[cur]!, to: cur });
    cur = parent[cur]!;
  }

  for (const t of adj[vulnNode.id] || []) {
    pathEdges.push({ from: vulnNode.id, to: t });
  }
  return pathEdges;
}

/* ================================================================
   REVEAL ANIMATION — compute ordered node sequence from flow edges
   ================================================================ */

export function computeRevealSequence(flowEdges: PathEdge[]): string[] {
  if (flowEdges.length === 0) return [];
  const seq = [flowEdges[0].from];
  for (const e of flowEdges) {
    if (seq[seq.length - 1] !== e.to) seq.push(e.to);
  }
  return seq;
}

/* Evaluate a cubic Bézier at parameter t */
export function evalCubicBezier(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

/* ================================================================
   EXPLOIT FLOW PULSE — animated dot traveling the attack path
   ================================================================ */

export interface FlowSegment {
  x1: number; y1: number;
  cp1x: number; cp1y: number;
  cp2x: number; cp2y: number;
  x2: number; y2: number;
  isExploit: boolean;
}

export const PULSE_SEGMENT_DUR = 1100;
export const PULSE_TRAIL_COUNT = 4;
