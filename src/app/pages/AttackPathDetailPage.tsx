import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, ZoomIn, ZoomOut, Shield, Globe, Cloud, Server, Database, AlertTriangle, RotateCcw, Zap, ChevronDown, Crosshair, Bug, Settings2, ExternalLink, Network, FileText } from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { Badge } from "../shared/components/ui/Badge";
import { useAiBox } from "../features/ai-box";
import { getPersonaAiBoxSuggestions } from "../shared/skills";
import { usePersona } from "../features/persona";
import type { PathNode, PathEdge, BlastRadiusAsset, BlastRadiusData, LayoutResult, AttackPathData } from "./attack-path/types";
import type { FlowSegment, ChainStep } from "./attack-path/graph-layout";
import { ATTACK_PATHS, DEFAULT_PATH, nodeIconMap, nodeColorMap, severityAccent } from "./attack-path/data";
import { GRID_SIZE, NODE_W, NODE_H, VULN_NODE_W, VULN_NODE_H, VULN_KEV_H, VULN_KEV_GAP, H_SPACING, V_PAIR_SPACING, MIN_ZOOM, MAX_ZOOM, FIT_PADDING, FIT_ZOOM_MIN, FIT_ZOOM_MAX, ZOOM_STEP_BUTTON, ZOOM_SENSITIVITY, PAN_MARGIN_RATIO, BR_PILL_W, BR_PILL_H, BR_PILL_GAP_X, VULN_CARD_W, VULN_CARD_H, VULN_CARD_GAP_Y, VULN_CARD_ARROW_H, CHAIN_STEP_H, CHAIN_CONNECTOR_H, CHAIN_PAD, CHAIN_HEADER_H, CHAIN_W, CHAIN_GAP_Y, BR_W, BR_GAP_X, BR_CARD_MIN, BR_CARD_H, BR_COLS, BR_GRID_GAP, BR_HEADER_H, BR_SUMMARY_H, BR_PANEL_PAD, computeGraphLayout, computeFitView, clampPan, computeAttackChainToNode, computeChainPanelHeight, computeExploitFlow, computeRevealSequence, evalCubicBezier } from "./attack-path/graph-layout";
import { InsightsPanel } from "./attack-path/InsightsPanel";
import { getControlsForPath } from "../shared/entity-graph";

const PULSE_SEGMENT_DUR = 1100;
const PULSE_TRAIL_COUNT = 4;

function ExploitFlowPulse({
  flowEdges, nodes, getPos, gradientId, isHighlighted,
}: {
  flowEdges: PathEdge[];
  nodes: PathNode[];
  getPos: (id: string) => { x: number; y: number };
  gradientId: string;
  isHighlighted: boolean;
}) {
  const groupRef = useRef<SVGGElement>(null);
  const rafRef = useRef<number>(0);
  const highlightRef = useRef(isHighlighted);
  highlightRef.current = isHighlighted;

  const segments = useMemo<FlowSegment[]>(() => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    return flowEdges.map((edge) => {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);
      const fW = fromNode?.isVulnerable ? VULN_NODE_W : NODE_W;
      const fH = fromNode?.isVulnerable ? VULN_NODE_H : NODE_H;
      const tW = toNode?.isVulnerable ? VULN_NODE_W : NODE_W;
      const tH = toNode?.isVulnerable ? VULN_NODE_H : NODE_H;
      const fp = getPos(edge.from);
      const tp = getPos(edge.to);
      const x1 = fp.x + fW / 2, y1 = fp.y + fH / 2;
      const x2 = tp.x + tW / 2, y2 = tp.y + tH / 2;
      const dx = x2 - x1;
      return {
        x1, y1, cp1x: x1 + dx * 0.45, cp1y: y1,
        cp2x: x2 - dx * 0.45, cp2y: y2, x2, y2,
        isExploit: !!fromNode?.isVulnerable || !!toNode?.isVulnerable,
      };
    });
  }, [flowEdges, nodes, getPos]);

  const totalDur = segments.length * PULSE_SEGMENT_DUR;

  useEffect(() => {
    if (segments.length === 0) return;
    const g = groupRef.current;
    if (!g) return;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % totalDur;
      const children = g.children;

      for (let ti = 0; ti <= PULSE_TRAIL_COUNT; ti++) {
        const trailOffset = ti * 45;
        let tElapsed = elapsed - trailOffset;
        if (tElapsed < 0) tElapsed += totalDur;
        const segIdx = Math.min(Math.floor(tElapsed / PULSE_SEGMENT_DUR), segments.length - 1);
        const raw = (tElapsed % PULSE_SEGMENT_DUR) / PULSE_SEGMENT_DUR;
        const te = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
        const seg = segments[segIdx];
        const px = String(evalCubicBezier(te, seg.x1, seg.cp1x, seg.cp2x, seg.x2));
        const py = String(evalCubicBezier(te, seg.y1, seg.cp1y, seg.cp2y, seg.y2));

        const hi = highlightRef.current;
        const isTail = ti > 0;
        const glowEl = children[ti * 2] as SVGCircleElement | undefined;
        const coreEl = children[ti * 2 + 1] as SVGCircleElement | undefined;
        if (glowEl) {
          glowEl.setAttribute("cx", px);
          glowEl.setAttribute("cy", py);
          const fadeA = isTail ? Math.max(0.08, 0.5 - ti * 0.1) : 1;
          glowEl.setAttribute("opacity", String(fadeA * (hi ? 0.38 : 0.18)));
          glowEl.setAttribute("r", String(hi ? (isTail ? 10 : 16) : (isTail ? 6 : 10)));
        }
        if (coreEl) {
          coreEl.setAttribute("cx", px);
          coreEl.setAttribute("cy", py);
          const coreA = isTail ? Math.max(0.15, 0.75 - ti * 0.15) : 1;
          coreEl.setAttribute("opacity", String(coreA * (hi ? 0.95 : 0.65)));
          coreEl.setAttribute("r", String(hi ? (isTail ? 3 : 5) : (isTail ? 2 : 3.5)));
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [segments, totalDur]);

  if (segments.length === 0) return null;

  const dots: React.ReactElement[] = [];
  for (let ti = 0; ti <= PULSE_TRAIL_COUNT; ti++) {
    dots.push(
      <circle key={`glow-${ti}`} r={10} fill="#ff6b35" opacity={0.18} filter={`url(#pulse-glow-${gradientId})`} />,
      <circle key={`core-${ti}`} r={3.5} fill="#ff6b35" opacity={0.65} />,
    );
  }
  return <g ref={groupRef}>{dots}</g>;
}

/* ================================================================
   GRAPH CANVAS COMPONENT
   ================================================================ */

function GraphCanvas({
  pathData,
  pathId,
  selectedNodeId,
  onSelectNode,
}: {
  pathData: AttackPathData;
  pathId: string;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null, node?: PathNode) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const dragDist = useRef(0);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const hasAutoFit = useRef(false);
  const [autoFitDone, setAutoFitDone] = useState(false);
  const animTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const panRafId = useRef(0);

  /* Hover: ref-based (no React re-renders on pointer move) */
  const hoveredNodeRef = useRef<string | null>(null);

  /* Expansion state: attack chain + blast radius */
  const [showAttackChain, setShowAttackChain] = useState(false);
  const [showBlastRadius, setShowBlastRadius] = useState(false);
  /* Keep kevExpandedNodeId derived from the vulnerable node for compatibility */
  const vulnNode = useMemo(() => pathData.nodes.find((n) => n.isVulnerable), [pathData.nodes]);
  const kevExpandedNodeId = vulnNode?.id || null;

  /* Asset inspection (Insights panel) state */
  const [inspectedAsset, setInspectedAsset] = useState<BlastRadiusAsset | null>(null);

  const handleSelectAsset = useCallback((asset: BlastRadiusAsset) => {
    setInspectedAsset(asset);
  }, []);

  const handleCloseInsights = useCallback(() => {
    setInspectedAsset(null);
  }, []);

  const toggleAttackChain = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAttackChain((prev) => {
      if (prev) setShowBlastRadius(false);
      return !prev;
    });
  }, []);

  const toggleBlastRadius = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBlastRadius((prev) => !prev);
  }, []);

  const attackChain = useMemo(() => {
    if (!kevExpandedNodeId) return [];
    return computeAttackChainToNode(kevExpandedNodeId, pathData.nodes, pathData.edges);
  }, [kevExpandedNodeId, pathData.nodes, pathData.edges]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0];
      if (r) setCanvasSize({ w: r.contentRect.width, h: r.contentRect.height });
    });
    ro.observe(el);
    setCanvasSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const layout = useMemo(
    () => computeGraphLayout(pathData.nodes, pathData.edges),
    [pathData.nodes, pathData.edges],
  );

  /* Effective bbox — includes blast radius panel when expanded */
  const effectiveBbox = useMemo(() => {
    const bbox = layout.bbox;
    if (!showBlastRadius || !vulnNode) return bbox;
    const vulnPos = layout.positions.get(vulnNode.id);
    if (!vulnPos) return bbox;
    const panelRight = vulnPos.x + VULN_NODE_W + BR_PILL_GAP_X + INLINE_BR_W;
    const brH = computeInlineBRHeight(pathData.blastRadius.assets.length, INLINE_BR_W);
    const panelBottom = vulnPos.y - 10 + brH;
    return {
      ...bbox,
      maxX: Math.max(bbox.maxX, panelRight),
      maxY: Math.max(bbox.maxY, panelBottom),
      w: Math.max(bbox.maxX, panelRight) - bbox.minX,
      h: Math.max(bbox.maxY, panelBottom) - bbox.minY,
    };
  }, [layout, showBlastRadius, vulnNode, pathData.blastRadius.assets.length]);

  /* Refs for clampPan inside event listeners */
  const effectiveBboxRef = useRef(effectiveBbox);
  effectiveBboxRef.current = effectiveBbox;
  const canvasSizeRef = useRef(canvasSize);
  canvasSizeRef.current = canvasSize;

  useEffect(() => {
    if (hasAutoFit.current) return;
    if (canvasSize.w < 50 || canvasSize.h < 50) return;
    if (layout.bbox.w === 0) return;
    hasAutoFit.current = true;
    const fit = computeFitView(layout.bbox, canvasSize.w, canvasSize.h);
    setZoom(fit.zoom);
    setPan({ x: fit.panX, y: fit.panY });
    setAutoFitDone(true);
  }, [canvasSize, layout]);

  const startAnimation = useCallback((durationMs = 320) => {
    setIsAnimating(true);
    clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => setIsAnimating(false), durationMs);
  }, []);

  const animateToFit = useCallback(() => {
    const bbox = layout.bbox;
    if (bbox.w === 0) return;
    let adjustedBbox = bbox;
    if (showBlastRadius && vulnNode) {
      const vulnPos = layout.positions.get(vulnNode.id);
      if (vulnPos) {
        const panelRight = vulnPos.x + VULN_NODE_W + BR_PILL_GAP_X + INLINE_BR_W;
        const brH = computeInlineBRHeight(pathData.blastRadius.assets.length, INLINE_BR_W);
        const panelBottom = vulnPos.y - 10 + brH;
        adjustedBbox = {
          ...bbox,
          maxX: Math.max(bbox.maxX, panelRight),
          maxY: Math.max(bbox.maxY, panelBottom),
          w: Math.max(bbox.maxX, panelRight) - bbox.minX,
          h: Math.max(bbox.maxY, panelBottom) - bbox.minY,
        };
      }
    }
    const fit = computeFitView(adjustedBbox, canvasSize.w, canvasSize.h);
    startAnimation(350);
    setZoom(fit.zoom);
    setPan({ x: fit.panX, y: fit.panY });
  }, [layout, canvasSize, startAnimation, showBlastRadius, vulnNode, pathData.blastRadius.assets.length]);

  /* Auto-fit when blast radius panel expands/collapses */
  useEffect(() => {
    if (!hasAutoFit.current) return;
    if (canvasSize.w < 50) return;
    const bbox = layout.bbox;
    if (bbox.w === 0) return;
    let adjustedBbox = bbox;
    if (showBlastRadius && vulnNode) {
      const vulnPos = layout.positions.get(vulnNode.id);
      if (vulnPos) {
        const panelRight = vulnPos.x + VULN_NODE_W + BR_PILL_GAP_X + INLINE_BR_W;
        const brH = computeInlineBRHeight(pathData.blastRadius.assets.length, INLINE_BR_W);
        const panelBottom = vulnPos.y - 10 + brH;
        adjustedBbox = {
          ...bbox,
          maxX: Math.max(bbox.maxX, panelRight),
          maxY: Math.max(bbox.maxY, panelBottom),
          w: Math.max(bbox.maxX, panelRight) - bbox.minX,
          h: Math.max(bbox.maxY, panelBottom) - bbox.minY,
        };
      }
    }
    const fit = computeFitView(adjustedBbox, canvasSize.w, canvasSize.h);
    startAnimation(380);
    setZoom(fit.zoom);
    setPan({ x: fit.panX, y: fit.panY });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBlastRadius]);

  const handleZoomIn = useCallback(() => {
    startAnimation(280);
    setZoom((z) => {
      const nz = Math.min(z + ZOOM_STEP_BUTTON, MAX_ZOOM);
      const s = nz / z;
      const cx = canvasSize.w / 2, cy = canvasSize.h / 2;
      setPan((p) => {
        const rawX = cx - (cx - p.x) * s;
        const rawY = cy - (cy - p.y) * s;
        return clampPan(rawX, rawY, nz, effectiveBboxRef.current, canvasSize.w, canvasSize.h);
      });
      return nz;
    });
  }, [canvasSize, startAnimation]);

  const handleZoomOut = useCallback(() => {
    startAnimation(280);
    setZoom((z) => {
      const nz = Math.max(z - ZOOM_STEP_BUTTON, MIN_ZOOM);
      const s = nz / z;
      const cx = canvasSize.w / 2, cy = canvasSize.h / 2;
      setPan((p) => {
        const rawX = cx - (cx - p.x) * s;
        const rawY = cy - (cy - p.y) * s;
        return clampPan(rawX, rawY, nz, effectiveBboxRef.current, canvasSize.w, canvasSize.h);
      });
      return nz;
    });
  }, [canvasSize, startAnimation]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const delta = e.ctrlKey ? -e.deltaY * 2 : -e.deltaY;
    const factor = Math.exp(delta * ZOOM_SENSITIVITY);
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;
    setZoom((prev) => {
      const next = Math.max(MIN_ZOOM, Math.min(prev * factor, MAX_ZOOM));
      const s = next / prev;
      setPan((p) => {
        const rawX = cursorX - (cursorX - p.x) * s;
        const rawY = cursorY - (cursorY - p.y) * s;
        return clampPan(rawX, rawY, next, effectiveBboxRef.current, canvasSizeRef.current.w, canvasSizeRef.current.h);
      });
      return next;
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setIsAnimating(false);
    dragDist.current = 0;
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      dragDist.current = Math.sqrt(dx * dx + dy * dy);
      if (dragDist.current > 4) hoveredNodeRef.current = null;
      // RAF-throttle: only one setPan per animation frame
      if (panRafId.current) return;
      panRafId.current = requestAnimationFrame(() => {
        panRafId.current = 0;
        const ddx = e.clientX - panStart.current.x;
        const ddy = e.clientY - panStart.current.y;
        const rawX = panStart.current.panX + ddx;
        const rawY = panStart.current.panY + ddy;
        const clamped = clampPan(rawX, rawY, zoomRef.current, effectiveBboxRef.current, canvasSizeRef.current.w, canvasSizeRef.current.h);
        setPan(clamped);
      });
    };
    const up = () => {
      setIsPanning(false);
      if (panRafId.current) { cancelAnimationFrame(panRafId.current); panRafId.current = 0; }
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [isPanning]);

  const handleCanvasClick = useCallback(() => {
    if (dragDist.current < 5) onSelectNode(null);
  }, [onSelectNode]);

  const handleNodeClick = useCallback((e: React.MouseEvent, node: PathNode) => {
    e.stopPropagation();
    if (dragDist.current < 5) {
      onSelectNode(selectedNodeId === node.id ? null : node.id, node);
    }
  }, [onSelectNode, selectedNodeId]);

  const connectedEdgeKeys = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const keys = new Set<string>();
    pathData.edges.forEach((edge) => {
      if (edge.from === selectedNodeId || edge.to === selectedNodeId) keys.add(`${edge.from}-${edge.to}`);
    });
    return keys;
  }, [selectedNodeId, pathData.edges]);

  /* hoveredEdgeKeys removed — hover no longer triggers React state/re-renders */

  /* Exploit flow path for animated pulse */
  const exploitFlowEdges = useMemo(
    () => computeExploitFlow(pathData.nodes, pathData.edges),
    [pathData.nodes, pathData.edges],
  );
  const exploitFlowKeys = useMemo(
    () => new Set(exploitFlowEdges.map((e) => `${e.from}-${e.to}`)),
    [exploitFlowEdges],
  );

  /* ---- Precomputed node index for O(1) lookups (avoids .find() in edge loop) ---- */
  const nodeById = useMemo(() => {
    const m = new Map<string, PathNode>();
    for (const n of pathData.nodes) m.set(n.id, n);
    return m;
  }, [pathData.nodes]);

  /* ---- Progressive reveal animation ---- */
  const prefersReducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const revealSequence = useMemo(
    () => computeRevealSequence(exploitFlowEdges),
    [exploitFlowEdges],
  );
  const revealSequenceSet = useMemo(() => new Set(revealSequence), [revealSequence]);
  const totalRevealSteps = revealSequence.length;
  const [revealedCount, setRevealedCount] = useState(() => prefersReducedMotion ? totalRevealSteps : 0);
  const [revealFinished, setRevealFinished] = useState(prefersReducedMotion);
  const revealComplete = revealFinished;
  const revealRan = useRef(prefersReducedMotion);

  useEffect(() => {
    if (revealRan.current) return;
    if (!autoFitDone) return;
    revealRan.current = true;
    const STEP_INTERVAL = 470;
    let step = 0;
    const reveal = () => {
      step++;
      setRevealedCount(step);
      if (step < totalRevealSteps) {
        timerId = window.setTimeout(reveal, STEP_INTERVAL);
      } else {
        // Delay revealFinished so the last node's entrance animation can play
        timerId = window.setTimeout(() => setRevealFinished(true), 500);
      }
    };
    let timerId = window.setTimeout(reveal, 180);
    return () => window.clearTimeout(timerId);
  }, [autoFitDone, totalRevealSteps]);

  const revealedNodeSet = useMemo(() => {
    const s = new Set<string>();
    for (let i = 0; i < revealedCount && i < revealSequence.length; i++) {
      s.add(revealSequence[i]);
    }
    return s;
  }, [revealedCount, revealSequence]);

  const revealedEdgeSet = useMemo(() => {
    const s = new Set<string>();
    for (let i = 1; i < revealedCount && i < revealSequence.length; i++) {
      s.add(`${revealSequence[i - 1]}-${revealSequence[i]}`);
    }
    return s;
  }, [revealedCount, revealSequence]);

  const justRevealedId = revealedCount > 0 && revealedCount <= revealSequence.length
    ? revealSequence[revealedCount - 1]
    : null;
  const justRevealedEdge = revealedCount >= 2 && revealedCount <= revealSequence.length
    ? `${revealSequence[revealedCount - 2]}-${revealSequence[revealedCount - 1]}`
    : null;

  const isKevActive = showAttackChain;
  const shouldPulseGlow = !showBlastRadius && !showAttackChain;

  const gradientId = React.useId();

  const getPos = useCallback(
    (nodeId: string) => layout.positions.get(nodeId) || { x: 0, y: 0 },
    [layout],
  );

  const gTransitionStyle: React.CSSProperties | undefined = isAnimating
    ? { transition: "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }
    : undefined;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 rounded-[18px] border overflow-hidden select-none"
      style={{ backgroundColor: colors.bgApp, borderColor: colors.border, cursor: isPanning ? "grabbing" : "grab" }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onClick={handleCanvasClick}
    >
      <svg className="absolute inset-0 w-full h-full" style={{ minHeight: "100%" }}>
        <defs>
          <pattern id={`grid-${gradientId}`} width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse" patternTransform={`translate(${pan.x % GRID_SIZE},${pan.y % GRID_SIZE})`}>
            <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="rgba(87,177,255,0.06)" strokeWidth="0.5" />
          </pattern>
          <filter id={`glow-${gradientId}`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`selected-glow-${gradientId}`}>
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* hover-glow filter removed — hover no longer triggers animations */}
          <radialGradient id={`vuln-glow-${gradientId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF5757" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FF5757" stopOpacity="0" />
          </radialGradient>
          <filter id={`pulse-glow-${gradientId}`}>
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id={`pulse-grad-${gradientId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff8a40" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FF5757" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill={`url(#grid-${gradientId})`} />

        <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`} style={gTransitionStyle}>
          {/* ---- Edges ---- */}
          {pathData.edges.map((edge) => {
            const fromNode = nodeById.get(edge.from);
            const toNode = nodeById.get(edge.to);
            const fromNW = fromNode?.isVulnerable ? VULN_NODE_W : NODE_W;
            const fromNH = fromNode?.isVulnerable ? VULN_NODE_H : NODE_H;
            const toNW = toNode?.isVulnerable ? VULN_NODE_W : NODE_W;
            const toNH = toNode?.isVulnerable ? VULN_NODE_H : NODE_H;
            const fromPos = getPos(edge.from);
            const toPos = getPos(edge.to);
            const x1 = fromPos.x + fromNW / 2, y1 = fromPos.y + fromNH / 2;
            const x2 = toPos.x + toNW / 2, y2 = toPos.y + toNH / 2;
            const dx = x2 - x1;
            const cp1x = x1 + dx * 0.45;
            const cp2x = x2 - dx * 0.45;

            const isExploitPath = !!fromNode?.isVulnerable || !!toNode?.isVulnerable;
            const edgeKey = `${edge.from}-${edge.to}`;
            const isHighlighted = connectedEdgeKeys.has(edgeKey);
            const isOnFlowPath = exploitFlowKeys.has(edgeKey);
            const isFlowActive = isOnFlowPath && isKevActive;

            /* Color & width adapt to state */
            let edgeColor: string;
            let edgeWidth: number;
            let dashArray: string | undefined;
            let filterUrl: string | undefined;

            if (isHighlighted) {
              edgeColor = "#57b1ff";
              edgeWidth = 3.5;
              filterUrl = `url(#selected-glow-${gradientId})`;
            } else if (isFlowActive && isExploitPath) {
              /* Exploit segment + KEV active = bright red-orange glow */
              edgeColor = "#ff5533";
              edgeWidth = 3;
              filterUrl = `url(#glow-${gradientId})`;
            } else if (isFlowActive) {
              /* Entry segment of flow + KEV active = brighter blue */
              edgeColor = "rgba(87,177,255,0.55)";
              edgeWidth = 2;
              dashArray = "6 4";
              filterUrl = `url(#glow-${gradientId})`;
            } else if (isExploitPath) {
              edgeColor = "#FF5757";
              edgeWidth = 2.5;
              filterUrl = `url(#glow-${gradientId})`;
            } else if (isOnFlowPath) {
              /* Entry path on flow route — slightly brighter than non-flow */
              edgeColor = "rgba(87,177,255,0.38)";
              edgeWidth = 1.5;
              dashArray = "6 4";
            } else {
              edgeColor = "rgba(87,177,255,0.22)";
              edgeWidth = 1.2;
              dashArray = "6 4";
            }

            /* Hover-based edge highlighting removed — only selection + attack-path triggers */
            const showGlowUnderlay = isHighlighted || isExploitPath || isFlowActive;

            /* ---- Reveal animation for edges ---- */
            const isOnRevealPath = revealSequenceSet.has(edge.from) && revealSequenceSet.has(edge.to);
            const isEdgeRevealed = revealComplete || !isOnRevealPath || revealedEdgeSet.has(edgeKey);
            const isJustRevealed = justRevealedEdge === edgeKey;
            // Approximate Bézier arc length for dash draw animation
            const approxLen = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * 1.2;

            const pathD = `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;

            return (
              <g key={edgeKey} style={{
                opacity: isEdgeRevealed ? 1 : 0,
                transition: "opacity 200ms ease",
              }}>
                {showGlowUnderlay && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      isHighlighted ? "rgba(87,177,255,0.2)"
                        : isFlowActive && isExploitPath ? "rgba(255,77,79,0.22)"
                        : isFlowActive ? "rgba(87,177,255,0.12)"
                        : "rgba(255,77,79,0.12)"
                    }
                    strokeWidth={isHighlighted ? 10 : isFlowActive ? 10 : 8}
                    strokeLinecap="round"
                    style={{ transition: "stroke 150ms ease, opacity 150ms ease" }}
                  />
                )}
                <path
                  d={pathD}
                  fill="none"
                  stroke={edgeColor}
                  strokeWidth={edgeWidth}
                  strokeDasharray={isJustRevealed ? `${approxLen}` : dashArray}
                  strokeLinecap="round"
                  filter={filterUrl}
                  style={isJustRevealed ? {
                    ["--edge-length" as string]: approxLen,
                    animation: `reveal-edge-draw 200ms ease-out forwards`,
                  } : { transition: "stroke 150ms ease, opacity 150ms ease" }}
                />
                <ArrowHead x={x2} y={y2} fromX={cp2x} fromY={y2} color={edgeColor} nodeW={toNW} nodeH={toNH} />
              </g>
            );
          })}

          {/* ---- Exploit Flow Animated Pulse (only after reveal completes) ---- */}
          {revealComplete && (
            <ExploitFlowPulse
              flowEdges={exploitFlowEdges}
              nodes={pathData.nodes}
              getPos={getPos}
              gradientId={gradientId}
              isHighlighted={isKevActive}
            />
          )}

          {/* ---- Simple Nodes (non-vulnerable) ---- */}
          {pathData.nodes.filter((n) => !n.isVulnerable).map((node) => {
            const pos = getPos(node.id);
            const Icon = nodeIconMap[node.icon] || Server;
            const accentColor = nodeColorMap[node.icon] || "#57b1ff";
            const cx = pos.x + NODE_W / 2;
            const cy = pos.y + NODE_H / 2;
            const isSelected = selectedNodeId === node.id;
            const isNodeRevealed = revealComplete || !revealSequenceSet.has(node.id) || revealedNodeSet.has(node.id);
            const isNodeJustRevealed = justRevealedId === node.id && !revealComplete;

            /* Derive visual states from selection only (no hover re-renders) */
            const borderStroke = isSelected
              ? "#57b1ff"
              : `${accentColor}45`;
            const borderWidth = isSelected ? 1.5 : 1;
            const bgFill = isSelected
              ? "rgba(87,177,255,0.08)"
              : "rgba(6,12,20,0.92)";

            return (
              <g
                key={node.id}
                style={{
                  cursor: "pointer",
                  opacity: isNodeRevealed ? 1 : 0,
                  transition: "opacity 150ms ease",
                }}
                onClick={(e) => handleNodeClick(e, node)}
              >
                {/* Reveal flash glow */}
                {isNodeJustRevealed && (
                  <circle cx={cx} cy={cy} r={50} fill={`${accentColor}00`} stroke={accentColor} strokeWidth={2} opacity={0}>
                    <animate attributeName="r" values="20;55" dur="0.4s" fill="freeze" />
                    <animate attributeName="opacity" values="0.5;0" dur="0.4s" fill="freeze" />
                  </circle>
                )}
                {/* Selection glow ring — GPU-friendly opacity animation */}
                <rect
                  x={pos.x - 5} y={pos.y - 5} width={NODE_W + 10} height={NODE_H + 10} rx={15}
                  fill="none" stroke="#57b1ff" strokeWidth={1.5} strokeDasharray="4 3"
                  opacity={isSelected ? 1 : 0}
                  style={{ transition: "opacity 150ms ease" }}
                >
                  {isSelected && (
                    <animate attributeName="stroke-dashoffset" values="0;-14" dur="1s" repeatCount="indefinite" />
                  )}
                </rect>
                <rect
                  x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx={12}
                  fill={bgFill}
                  stroke={borderStroke}
                  strokeWidth={borderWidth}
                  style={{ transition: "stroke 150ms ease, opacity 150ms ease" }}
                />
                <circle cx={cx} cy={pos.y + 24} r={14} fill={`${accentColor}18`} stroke={`${accentColor}55`} strokeWidth={1} />
                <foreignObject x={cx - 9} y={pos.y + 15} width={18} height={18}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 18, height: 18 }}>
                    <Icon size={14} color={accentColor} strokeWidth={1.5} />
                  </div>
                </foreignObject>
                <text x={cx} y={pos.y + 48} textAnchor="middle" fill={colors.textPrimary} fontSize="10" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">{node.label}</text>
                {node.sublabel && <text x={cx} y={pos.y + 61} textAnchor="middle" fill={colors.textDim} fontSize="8" fontFamily="system-ui, -apple-system, sans-serif">{node.sublabel}</text>}
              </g>
            );
          })}

          {/* ---- Vulnerable Asset Detail Card ---- */}
          {pathData.nodes.filter((n) => n.isVulnerable).map((node) => {
            const pos = getPos(node.id);
            const cx = pos.x + VULN_NODE_W / 2;
            const cy = pos.y + VULN_NODE_H / 2;
            const primaryAsset = pathData.blastRadius.assets[0];
            const severity = pathData.priority;
            const sevAccent = severityAccent[severity] || "#FF5757";
            const isVulnRevealed = revealComplete || revealedNodeSet.has(node.id);
            const isVulnJustRevealed = justRevealedId === node.id && !revealComplete;

            return (
              <g
                key={node.id}
                style={{
                  cursor: "pointer",
                  opacity: isVulnRevealed ? 1 : 0,
                  transition: "opacity 150ms ease",
                }}
              >
                {/* Vuln card entrance scale animation wrapper */}
                {/* Vuln entrance burst — stronger orange glow ring */}
                {isVulnJustRevealed && (
                  <g>
                    <circle cx={cx} cy={cy} r={40} fill="none" stroke="#FF740A" strokeWidth={3} opacity={0} filter={`url(#glow-${gradientId})`}>
                      <animate attributeName="r" values="50;150" dur="0.5s" fill="freeze" />
                      <animate attributeName="opacity" values="0.6;0" dur="0.5s" fill="freeze" />
                    </circle>
                    <circle cx={cx} cy={cy} r={30} fill="rgba(255,122,26,0.25)" opacity={0}>
                      <animate attributeName="r" values="30;110" dur="0.45s" fill="freeze" />
                      <animate attributeName="opacity" values="0.25;0" dur="0.45s" fill="freeze" />
                    </circle>
                  </g>
                )}
                {/* Pulsing glow behind card */}
                <circle cx={cx} cy={cy} r={shouldPulseGlow ? 90 : (isKevActive ? 120 : 100)} fill={`url(#vuln-glow-${gradientId})`} opacity={shouldPulseGlow ? undefined : (isKevActive ? 0.65 : 0.4)}>
                  {shouldPulseGlow && (
                    <animate attributeName="r" values="85;100;85" dur="2.8s" repeatCount="indefinite" />
                  )}
                  {shouldPulseGlow && (
                    <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.8s" repeatCount="indefinite" />
                  )}
                  {!shouldPulseGlow && isKevActive && (
                    <animate attributeName="r" values="95;125;95" dur="2s" repeatCount="indefinite" />
                  )}
                  {!shouldPulseGlow && isKevActive && (
                    <animate attributeName="opacity" values="0.65;1;0.65" dur="2s" repeatCount="indefinite" />
                  )}
                </circle>

                {/* KEV badge above card — fades in with vuln card */}
                {node.cve && (
                  <g style={{
                    opacity: isVulnRevealed ? 1 : 0,
                    transition: "opacity 250ms ease 80ms",
                  }}>
                    <rect x={cx - 68} y={pos.y - VULN_KEV_H - VULN_KEV_GAP} width={136} height={VULN_KEV_H} rx={14}
                      fill={showAttackChain ? "rgba(255,77,79,0.30)" : "rgba(255,77,79,0.15)"}
                      stroke="#FF5757" strokeWidth={1}
                    />
                    <text x={cx} y={pos.y - VULN_KEV_GAP - VULN_KEV_H / 2 + 4} textAnchor="middle" fill="#FF5757" fontSize="10" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">KEV: {node.cve}</text>
                  </g>
                )}

                {/* Card outer glow — no hover animation, only state-driven */}
                <rect x={pos.x - 3} y={pos.y - 3} width={VULN_NODE_W + 6} height={VULN_NODE_H + 6} rx={16}
                  fill="none"
                  stroke="rgba(255,77,79,0.10)"
                  strokeWidth={5}
                  filter={`url(#glow-${gradientId})`}
                >
                  {shouldPulseGlow && (
                    <animate attributeName="stroke-opacity" values="0.08;0.22;0.08" dur="2.8s" repeatCount="indefinite" />
                  )}
                </rect>
                {/* Card background — no hover animation */}
                <rect x={pos.x} y={pos.y} width={VULN_NODE_W} height={VULN_NODE_H} rx={14}
                  fill="rgba(6,12,20,0.96)"
                  stroke={shouldPulseGlow ? undefined : "rgba(255,77,79,0.45)"}
                  strokeWidth={1.5}
                >
                  {shouldPulseGlow && (
                    <animate attributeName="stroke" values="rgba(255,77,79,0.35);rgba(255,100,60,0.65);rgba(255,77,79,0.35)" dur="2.8s" repeatCount="indefinite" />
                  )}
                </rect>

                {/* Card content */}
                <foreignObject x={pos.x} y={pos.y} width={VULN_NODE_W} height={VULN_NODE_H}>
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                      width: VULN_NODE_W, height: VULN_NODE_H, fontFamily: "system-ui, -apple-system, sans-serif",
                      color: colors.textPrimary, display: "flex", flexDirection: "column", borderRadius: 14, overflow: "hidden",
                      transform: isVulnJustRevealed ? "scale(1)" : undefined,
                      animation: isVulnJustRevealed ? "vuln-card-entrance 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : undefined,
                    }}>
                    {/* Header: icon + name + severity */}
                    <div style={{ padding: "12px 14px 6px", display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 7, backgroundColor: "rgba(255,77,79,0.12)",
                        border: "1px solid rgba(255,77,79,0.30)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <AlertTriangle size={14} color="#FF5757" strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: colors.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {node.label}
                        </div>
                        <div style={{ fontSize: 8, color: colors.textDim, marginTop: 1 }}>{node.sublabel}</div>
                      </div>
                      <span style={{
                        fontSize: 7.5, fontWeight: 700, color: sevAccent, textTransform: "uppercase", letterSpacing: "0.04em",
                        padding: "2px 7px", borderRadius: 4, backgroundColor: `${sevAccent}18`, border: `1px solid ${sevAccent}35`, flexShrink: 0,
                      }}>
                        {severity}
                      </span>
                    </div>

                    {/* ARN */}
                    <div style={{
                      padding: "0 14px 8px", fontSize: 7.5, color: colors.textDim,
                      fontFamily: "monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {primaryAsset?.arn || "N/A"}
                    </div>

                    <div style={{ height: 1, backgroundColor: "rgba(255,77,79,0.12)", margin: "0 14px", flexShrink: 0 }} />

                    {/* Metrics */}
                    <div style={{ padding: "10px 14px", display: "flex", gap: 20 }}>
                      <VulnMetric label="Vulnerabilities" value={primaryAsset?.vulnerabilities ?? pathData.vulnerabilities} color="#FF5757" />
                      <VulnMetric label="Misconfigs" value={primaryAsset?.misconfigurations ?? pathData.misconfigurations} color="#FF740A" />
                    </div>

                    <div style={{ height: 1, backgroundColor: "rgba(255,122,26,0.10)", margin: "0 14px", flexShrink: 0 }} />

                    {/* Expand chevron */}
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <button
                        onClick={toggleAttackChain}
                        style={{
                          width: "100%", height: 34, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                          cursor: "pointer", border: "none", background: "transparent", transition: "background-color 120ms ease",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,122,26,0.08)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                      >
                        <span style={{ fontSize: 8.5, fontWeight: 600, color: "#FF740A" }}>
                          {showAttackChain ? "Hide Attack Chain" : "Show Attack Chain"}
                        </span>
                        <ChevronDown size={12} color="#FF740A" strokeWidth={2.5} style={{
                          transform: showAttackChain ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 200ms ease",
                        }} />
                      </button>
                    </div>
                  </div>
                </foreignObject>

                {/* ---- Blast Radius: Pill (collapsed) or Panel (expanded) — only after reveal ---- */}
                {revealComplete && (() => {
                  const brAnchorX = pos.x + VULN_NODE_W + BR_PILL_GAP_X;
                  const connY = pos.y + VULN_NODE_H / 2;

                  if (!showBlastRadius) {
                    /* ---- Collapsed Pill ---- */
                    const pillY = pos.y + (VULN_NODE_H - BR_PILL_H) / 2;
                    return (
                      <g style={{ animation: "investigationFadeIn 300ms ease forwards" }}>
                        <line x1={pos.x + VULN_NODE_W} y1={connY} x2={brAnchorX} y2={connY}
                          stroke="rgba(255,122,26,0.35)" strokeWidth={1.5} strokeDasharray="5 4" strokeLinecap="round">
                          <animate attributeName="stroke-dashoffset" values="0;-18" dur="1.2s" repeatCount="indefinite" />
                        </line>
                        <rect x={brAnchorX} y={pillY} width={BR_PILL_W} height={BR_PILL_H} rx={BR_PILL_H / 2}
                          fill="rgba(6,12,20,0.92)" stroke="rgba(255,122,26,0.30)" strokeWidth={1.5} style={{ cursor: "pointer" }}
                        />
                        <foreignObject x={brAnchorX} y={pillY} width={BR_PILL_W} height={BR_PILL_H} style={{ cursor: "pointer" }}>
                          <div onClick={toggleBlastRadius} onMouseDown={(e) => e.stopPropagation()}
                            style={{ width: BR_PILL_W, height: BR_PILL_H, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", fontFamily: "system-ui, -apple-system, sans-serif" }}>
                            <Crosshair size={13} color="#FF740A" strokeWidth={2} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#FF740A" }}>Blast Radius</span>
                            <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,122,26,0.7)", backgroundColor: "rgba(255,122,26,0.12)", borderRadius: 8, padding: "1px 5px" }}>
                              {pathData.blastRadius.totalAssets}
                            </span>
                          </div>
                        </foreignObject>
                      </g>
                    );
                  }

                  /* ---- Expanded Panel ---- */
                  return (
                    <InlineBlastRadiusPanel
                      anchorX={brAnchorX}
                      anchorY={pos.y}
                      connFromX={pos.x + VULN_NODE_W}
                      connY={connY}
                      data={pathData.blastRadius}
                      gradientId={gradientId}
                      onCollapse={toggleBlastRadius}
                      onSelectAsset={handleSelectAsset}
                      selectedAssetId={inspectedAsset?.id ?? null}
                    />
                  );
                })()}
              </g>
            );
          })}

          {/* ---- Attack Chain + Blast Radius (below vuln card) ---- */}
          {showAttackChain && kevExpandedNodeId && attackChain.length > 0 && (() => {
            const vulnPos = getPos(kevExpandedNodeId);
            const cardBottom = vulnPos.y + VULN_NODE_H;
            const connCenterX = vulnPos.x + VULN_NODE_W / 2;
            return (
              <AttackChainOverlay
                vulnCardBottom={cardBottom}
                vulnCardCenterX={connCenterX}
                chain={attackChain}
                gradientId={gradientId}
              />
            );
          })()}
        </g>
      </svg>

      {/* Zoom controls + Reset View */}
      <div
        className="fixed bottom-[24px] right-[24px] z-50 flex flex-col gap-1 rounded-lg border p-1"
        style={{ backgroundColor: "rgba(6,12,20,0.92)", borderColor: colors.border, backdropFilter: "blur(8px)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-[rgba(87,177,255,0.1)] transition-colors" title="Zoom in">
          <ZoomIn size={16} color={colors.textMuted} />
        </button>
        <div className="text-center text-[9px] py-0.5 tabular-nums" style={{ color: colors.textDim }}>
          {Math.round(zoom * 100)}%
        </div>
        <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-[rgba(87,177,255,0.1)] transition-colors" title="Zoom out">
          <ZoomOut size={16} color={colors.textMuted} />
        </button>
        <div className="border-t my-0.5" style={{ borderColor: colors.border }} />
        <button
          onClick={animateToFit}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-[rgba(87,177,255,0.1)] transition-colors"
          title="Reset view to auto-fit"
        >
          <RotateCcw size={13} color={colors.textMuted} />
          <span className="text-[9px]" style={{ color: colors.textMuted }}>Reset</span>
        </button>
      </div>

      {/* Insights panel overlay */}
      {inspectedAsset && (
        <InsightsPanel asset={inspectedAsset} onClose={handleCloseInsights} sourcePathId={pathId} sourcePathName={pathData.name} />
      )}
    </div>
  );
}

/* ================================================================
   ARROW HEAD
   ================================================================ */

function ArrowHead({ x, y, fromX, fromY, color, nodeW = NODE_W, nodeH = NODE_H }: { x: number; y: number; fromX: number; fromY: number; color: string; nodeW?: number; nodeH?: number }) {
  const angle = Math.atan2(y - fromY, x - fromX);
  const size = 8;
  const tipX = x - Math.cos(angle) * (nodeW / 2 + 2);
  const tipY = y - Math.sin(angle) * (nodeH / 2 + 2);
  const p1x = tipX - size * Math.cos(angle - Math.PI / 6);
  const p1y = tipY - size * Math.sin(angle - Math.PI / 6);
  const p2x = tipX - size * Math.cos(angle + Math.PI / 6);
  const p2y = tipY - size * Math.sin(angle + Math.PI / 6);
  return <polygon points={`${tipX},${tipY} ${p1x},${p1y} ${p2x},${p2y}`} fill={color} style={{ transition: "fill 120ms ease" }} />;
}

/* ================================================================
   INLINE BLAST RADIUS PANEL — expands to the right of the vuln card
   ================================================================ */

const INLINE_BR_W = 600;
const INLINE_BR_HEADER_H = 46;
const INLINE_BR_SUMMARY_H = 82;
const INLINE_BR_PAD = 14;
const INLINE_BR_GRID_GAP = 8;
const INLINE_BR_CARD_MIN = 132;
const INLINE_BR_CARD_H = 100;
const INLINE_BR_MAX_H = 520;

function computeInlineBRHeight(assetCount: number, panelW: number): number {
  const colsApprox = Math.max(1, Math.floor((panelW - INLINE_BR_PAD * 2 + INLINE_BR_GRID_GAP) / (INLINE_BR_CARD_MIN + INLINE_BR_GRID_GAP)));
  const rows = Math.ceil(assetCount / colsApprox);
  const gridH = rows * INLINE_BR_CARD_H + Math.max(0, rows - 1) * INLINE_BR_GRID_GAP;
  const rawH = INLINE_BR_HEADER_H + INLINE_BR_SUMMARY_H + gridH + INLINE_BR_PAD * 3 + 4;
  return Math.min(rawH, INLINE_BR_MAX_H);
}

function InlineBlastRadiusPanel({
  anchorX, anchorY, connFromX, connY, data, gradientId, onCollapse, onSelectAsset, selectedAssetId,
}: {
  anchorX: number;
  anchorY: number;
  connFromX: number;
  connY: number;
  data: BlastRadiusData;
  gradientId: string;
  onCollapse: (e: React.MouseEvent) => void;
  onSelectAsset?: (asset: BlastRadiusAsset) => void;
  selectedAssetId?: string | null;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const panelH = computeInlineBRHeight(data.assets.length, INLINE_BR_W);
  const panelX = anchorX;
  const panelY = anchorY - 10;

  const sortedAssets = useMemo(
    () => [...data.assets].sort((a, b) => {
      const ord: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (ord[a.riskSeverity] ?? 9) - (ord[b.riskSeverity] ?? 9);
    }),
    [data.assets],
  );

  return (
    <g
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateX(0)" : "translateX(24px)",
        transition: "opacity 280ms cubic-bezier(0.22,1,0.36,1), transform 280ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Horizontal dashed connector from vuln card edge to panel */}
      <line x1={connFromX} y1={connY} x2={panelX} y2={connY}
        stroke="rgba(255,122,26,0.40)" strokeWidth={1.5} strokeDasharray="5 4" strokeLinecap="round"
        style={{ opacity: mounted ? 0.8 : 0, transition: "opacity 200ms ease-out 60ms" }}
      >
        <animate attributeName="stroke-dashoffset" values="0;-18" dur="1.2s" repeatCount="indefinite" />
      </line>

      {/* Outer glow */}
      <rect x={panelX - 3} y={panelY - 3} width={INLINE_BR_W + 6} height={panelH + 6} rx={18}
        fill="none" stroke="rgba(255,122,26,0.06)" strokeWidth={5} filter={`url(#glow-${gradientId})`}
      />
      {/* Background */}
      <rect x={panelX} y={panelY} width={INLINE_BR_W} height={panelH} rx={16}
        fill="rgba(6,12,20,0.97)" stroke="rgba(255,122,26,0.35)" strokeWidth={1.5}
      />

      {/* Content */}
      <foreignObject x={panelX} y={panelY} width={INLINE_BR_W} height={panelH}>
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          style={{
            width: INLINE_BR_W, height: panelH, fontFamily: "system-ui, -apple-system, sans-serif",
            color: colors.textPrimary, display: "flex", flexDirection: "column",
            overflow: "hidden", borderRadius: 16,
          }}
        >
          {/* ── Top bar (sticky — stays fixed at top) ��─ */}
          <div style={{
            height: INLINE_BR_HEADER_H, display: "flex", alignItems: "center", gap: 8,
            padding: "0 18px", borderBottom: "1px solid rgba(255,122,26,0.15)", flexShrink: 0,
            backgroundColor: "rgba(6,12,20,0.97)", zIndex: 2,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,122,26,0.10)",
              border: "1px solid rgba(255,122,26,0.25)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Crosshair size={14} color="#FF740A" strokeWidth={2} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>Blast Radius</span>
            <span style={{
              fontSize: 8.5, fontWeight: 600, color: "rgba(255,122,26,0.75)",
              backgroundColor: "rgba(255,122,26,0.10)", borderRadius: 10, padding: "2px 8px", marginLeft: 4,
            }}>
              {data.totalAssets} assets affected
            </span>
            <button
              onClick={onCollapse}
              style={{
                marginLeft: "auto", width: 28, height: 28, borderRadius: 7,
                border: "1px solid rgba(255,122,26,0.25)", backgroundColor: "rgba(255,122,26,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                transition: "background-color 120ms ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,122,26,0.14)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,122,26,0.06)"; }}
              title="Collapse Blast Radius"
            >
              <ExternalLink size={13} color="#FF740A" strokeWidth={2} />
            </button>
          </div>

          {/* ── Summary card (sticky — stays fixed below top bar) ── */}
          <div style={{
            margin: `${INLINE_BR_PAD}px ${INLINE_BR_PAD}px ${INLINE_BR_PAD / 2}px`, padding: "12px 16px",
            borderRadius: 10, backgroundColor: "rgba(255,122,26,0.035)",
            border: "1px solid rgba(255,122,26,0.16)", flexShrink: 0,
            zIndex: 2,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Network size={12} color="#FF740A" strokeWidth={2} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: "#FF740A" }}>Blast Radius via Network</span>
            </div>
            <div style={{ display: "flex", gap: 32 }}>
              <InlineBRMetric label="Total Assets" value={data.totalAssets} color="#57b1ff" />
              <InlineBRMetric label="Vulnerabilities" value={data.totalVulnerabilities} color="#FF5757" />
              <InlineBRMetric label="Misconfigurations" value={data.totalMisconfigurations} color="#FF740A" />
            </div>
          </div>

          {/* ── Scrollable asset grid ── */}
          <div
            className="br-scroll"
            style={{
              flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,122,26,0.25) transparent",
            }}
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, minmax(${INLINE_BR_CARD_MIN}px, 1fr))`,
              gap: INLINE_BR_GRID_GAP, padding: INLINE_BR_PAD,
            }}>
              {sortedAssets.map((asset, idx) => {
                const delay = 60 + idx * 25;
                return (
                  <div key={asset.id} style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateX(0) scale(1)" : "translateX(10px) scale(0.95)",
                    transition: `opacity 200ms ease-out ${delay}ms, transform 200ms ease-out ${delay}ms`,
                  }}>
                    <InlineBRAssetCard
                      asset={asset}
                      isSelected={selectedAssetId === asset.id}
                      onClick={() => onSelectAsset?.(asset)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </foreignObject>
    </g>
  );
}

function InlineBRMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 7.5, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: color, flexShrink: 0, position: "relative" as const, top: -1 }} />
        <span style={{ fontSize: 16, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      </div>
    </div>
  );
}

function InlineBRAssetCard({ asset, isSelected, onClick }: { asset: BlastRadiusAsset; isSelected?: boolean; onClick?: () => void }) {
  const accent = severityAccent[asset.riskSeverity] || colors.textDim;
  const selectedBorder = isSelected ? accent : `${accent}35`;
  const selectedBg = isSelected ? `${accent}14` : `${accent}06`;
  const selectedShadow = isSelected ? `0 0 16px ${accent}22, inset 0 0 0 1px ${accent}30` : `0 0 0 0 ${accent}00`;
  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      style={{
        borderRadius: 10, padding: "9px 11px", minWidth: 0, height: "100%",
        borderWidth: 1, borderStyle: "solid",
        borderTopColor: selectedBorder, borderRightColor: selectedBorder, borderBottomColor: selectedBorder,
        borderLeftWidth: 3, borderLeftColor: accent,
        backgroundColor: selectedBg,
        display: "flex", flexDirection: "column", gap: 5,
        cursor: "pointer",
        transition: "border-color 140ms ease, background-color 140ms ease, box-shadow 140ms ease, transform 140ms ease",
        boxShadow: selectedShadow,
        transform: isSelected ? "translateY(-1px)" : "translateY(0)",
      }}
      onMouseEnter={(e) => {
        if (isSelected) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderTopColor = accent;
        el.style.borderRightColor = accent;
        el.style.borderBottomColor = accent;
        el.style.borderLeftColor = accent;
        el.style.backgroundColor = `${accent}10`;
        el.style.boxShadow = `0 2px 12px ${accent}28, 0 1px 3px rgba(0,0,0,0.18)`;
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        if (isSelected) return;
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderTopColor = `${accent}35`;
        el.style.borderRightColor = `${accent}35`;
        el.style.borderBottomColor = `${accent}35`;
        el.style.borderLeftColor = accent;
        el.style.backgroundColor = `${accent}06`;
        el.style.boxShadow = `0 0 0 0 ${accent}00`;
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Icon + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 20, height: 20, borderRadius: 5, backgroundColor: `${accent}12`,
          border: `1px solid ${accent}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Server size={11} color={accent} strokeWidth={1.5} />
        </div>
        <span style={{
          fontSize: 9.5, fontWeight: 600, color: colors.textPrimary, flex: 1, minWidth: 0,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {asset.name}
        </span>
      </div>

      {/* ARN */}
      <div style={{
        fontSize: 7, color: colors.textDim, whiteSpace: "nowrap", overflow: "hidden",
        textOverflow: "ellipsis", fontFamily: "monospace", lineHeight: 1.3,
      }}>
        {asset.arn}
      </div>

      <div style={{ height: 1, backgroundColor: `${accent}12`, margin: "1px 0" }} />

      {/* Metrics */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Bug size={8} color="#FF5757" strokeWidth={1.5} />
          <span style={{ fontSize: 7, color: colors.textDim }}>Vulns</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#FF5757" }}>{asset.vulnerabilities}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Settings2 size={8} color="#FF740A" strokeWidth={1.5} />
          <span style={{ fontSize: 7, color: colors.textDim }}>Misconfigs</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#FF740A" }}>{asset.misconfigurations}</span>
        </div>
      </div>

      {/* Severity badge */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto" }}>
        <span style={{
          fontSize: 7, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.05em",
          padding: "2px 6px", borderRadius: 4, backgroundColor: `${accent}12`, border: `1px solid ${accent}24`,
        }}>
          {asset.riskSeverity}
        </span>
      </div>
    </div>
  );
}

/* ================================================================
   VULN METRIC (small helper)
   ================================================================ */

function VulnMetric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 7, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
      </div>
    </div>
  );
}

/* ================================================================
   ATTACK CHAIN OVERLAY
   ================================================================ */

function AttackChainOverlay({
  vulnCardBottom,
  vulnCardCenterX,
  chain,
  gradientId,
}: {
  vulnCardBottom: number;
  vulnCardCenterX: number;
  chain: ChainStep[];
  gradientId: string;
}) {
  const chainPanelH = computeChainPanelHeight(chain.length);
  const totalChainH = chainPanelH + 4;
  const panelX = vulnCardCenterX - CHAIN_W / 2;
  const panelY = vulnCardBottom + CHAIN_GAP_Y;

  const connStartX = vulnCardCenterX;
  const connStartY = vulnCardBottom;
  const connEndY = panelY;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const allSteps = useMemo(() => {
    const steps: Array<ChainStep & { isExploit?: boolean }> = chain.map((s) => ({ ...s }));
    steps.push({
      nodeId: "__exploit__",
      label: "Exploit / Priv Escalation",
      icon: "vuln",
      isVulnerable: false,
      cve: undefined,
      isExploit: true,
    });
    return steps;
  }, [chain]);

  const totalSteps = allSteps.length;

  return (
    <g
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? "scale(1)" : "scale(0.95)",
        transformOrigin: `${vulnCardCenterX}px ${vulnCardBottom}px`,
        transition: "opacity 150ms ease-out, transform 150ms ease-out",
      }}
    >
      {/* Dashed connector from vuln card to chain panel */}
      <line
        x1={connStartX} y1={connStartY} x2={connStartX} y2={connEndY}
        stroke="#FF740A" strokeWidth={1.5} strokeDasharray="5 4" strokeLinecap="round"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 250ms ease-out 80ms" }}
      >
        <animate attributeName="stroke-dashoffset" values="0;-18" dur="1.2s" repeatCount="indefinite" />
      </line>

      {/* Chain panel glow + bg */}
      <rect x={panelX - 3} y={panelY - 3} width={CHAIN_W + 6} height={totalChainH + 6} rx={14}
        fill="none" stroke="rgba(255,122,26,0.12)" strokeWidth={5} filter={`url(#glow-${gradientId})`}
      />
      <rect x={panelX} y={panelY} width={CHAIN_W} height={totalChainH} rx={12}
        fill="rgba(6,12,20,0.94)" stroke="rgba(255,122,26,0.40)" strokeWidth={1.5}
      />

      {/* Chain panel content */}
      <foreignObject x={panelX} y={panelY} width={CHAIN_W} height={totalChainH}>
        <div style={{
          width: CHAIN_W, height: totalChainH, fontFamily: "system-ui, -apple-system, sans-serif",
          color: colors.textPrimary, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 12,
        }}>
          {/* Header */}
          <div style={{
            height: CHAIN_HEADER_H, display: "flex", alignItems: "center", gap: 6, padding: "0 10px",
            borderBottom: "1px solid rgba(255,122,26,0.18)", flexShrink: 0,
          }}>
            <Zap size={11} color="#FF740A" strokeWidth={2} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "#FF740A" }}>Attack Chain</span>
            <span style={{
              marginLeft: "auto", fontSize: 8, fontWeight: 600, color: "rgba(255,122,26,0.7)",
              backgroundColor: "rgba(255,122,26,0.10)", borderRadius: 8, padding: "1px 5px",
            }}>
              {chain.length} steps
            </span>
          </div>

          {/* Steps */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: `${CHAIN_PAD}px 8px`, gap: 0 }}>
            {allSteps.map((step, idx) => {
              const isExploit = !!(step as { isExploit?: boolean }).isExploit;
              const isVuln = step.isVulnerable;
              const accentColor = isExploit ? "#FF5757" : isVuln ? "#FF5757" : nodeColorMap[step.icon] || "#57b1ff";
              const Icon = isExploit ? Zap : (nodeIconMap[step.icon] || Server);
              const isLast = idx === totalSteps - 1;
              const delay = 80 + idx * 50;

              return (
                <div key={step.nodeId} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
                  opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(6px)",
                  transition: `opacity 150ms ease-out ${delay}ms, transform 150ms ease-out ${delay}ms`,
                }}>
                  <div style={{
                    width: "100%", height: CHAIN_STEP_H, display: "flex", alignItems: "center", gap: 7, padding: "0 8px", borderRadius: 8,
                    border: isExploit ? "1px dashed rgba(255,77,79,0.45)" : isVuln ? "1px solid rgba(255,77,79,0.40)" : `1px solid ${accentColor}30`,
                    backgroundColor: isExploit ? "rgba(255,77,79,0.06)" : isVuln ? "rgba(255,77,79,0.08)" : "rgba(6,12,20,0.6)",
                    boxShadow: isVuln ? "0 0 10px rgba(255,77,79,0.10)" : isExploit ? "0 0 8px rgba(255,77,79,0.08)" : "none",
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", backgroundColor: `${accentColor}18`,
                      border: `1px solid ${accentColor}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Icon size={12} color={accentColor} strokeWidth={1.5} />
                    </div>
                    <span style={{
                      fontSize: 9.5, fontWeight: isVuln || isExploit ? 700 : 600,
                      color: isExploit ? "#FF5757" : colors.textPrimary,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1,
                    }}>
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div style={{
                      display: "flex", flexDirection: "column", alignItems: "center", height: CHAIN_CONNECTOR_H,
                      justifyContent: "center", opacity: mounted ? 1 : 0, transition: `opacity 150ms ease-out ${delay + 60}ms`,
                    }}>
                      <div style={{ width: 1, height: 8, backgroundColor: isVuln ? "rgba(255,77,79,0.40)" : `${accentColor}35` }} />
                      <ChevronDown size={10} strokeWidth={2} color={isVuln ? "rgba(255,77,79,0.55)" : `${accentColor}55`} style={{ marginTop: -3 }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </foreignObject>
    </g>
  );
}

/* legacy _BlastRadiusPanel — removed */
/* ================================================================
   DETAIL PAGE
   ================================================================ */

export default function AttackPathDetailPage() {
  const { pathId } = useParams<{ pathId: string }>();
  const navigate = useNavigate();
  const { openWithContext } = useAiBox();
  const { persona } = usePersona();
  const resolvedPathId = pathId || "";
  const knownPath = resolvedPathId in ATTACK_PATHS;
  const pathData = knownPath ? ATTACK_PATHS[resolvedPathId] : DEFAULT_PATH;
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    // Skip context setup for unknown paths — not-found guard renders below
    if (!knownPath) return;

    const contributingGaps = getControlsForPath(resolvedPathId);
    const gapSummary = contributingGaps.length > 0
      ? contributingGaps.map(g => `${g.control} (${g.framework}): ${g.title}`).join("; ")
      : "No mapped compliance gaps for this path.";

    openWithContext({
      type: "general" as const,
      label: pathData.name,
      sublabel: "Attack Path Graph",
      contextKey: `attack-path-detail:${resolvedPathId}`,
      greeting: `This is a **${pathData.priority.toUpperCase()} priority** path. Blast radius: **${pathData.blastRadius.totalAssets} assets** exposed — ${pathData.blastRadius.totalVulnerabilities} vulnerabilities and ${pathData.blastRadius.totalMisconfigurations} misconfigurations in scope.${contributingGaps.length > 0 ? ` **${contributingGaps.length} compliance gap${contributingGaps.length > 1 ? "s"  : ""}** contribute to reachability.` : ""} Ask me to walk each hop, explain the blast radius, or build a remediation case.`,
      suggestions: getPersonaAiBoxSuggestions("attack-path", persona, pathData.name, undefined, resolvedPathId),
      // Graph context — compliance gaps that enable this path
      graphContext: {
        pathId: resolvedPathId,
        priority: pathData.priority,
        contributingGaps: contributingGaps.map(g => ({
          control: g.control,
          framework: g.framework,
          title: g.title,
          severity: g.severity,
          contribution: g.contribution,
        })),
        gapSummary,
        blastRadiusAssets: pathData.blastRadius.totalAssets,
      },
    });
  }, [openWithContext, pathData.name, pathData.priority, pathData.blastRadius.totalAssets, resolvedPathId]);

  const handleSelectNode = useCallback((nodeId: string | null, _node?: PathNode) => {
    setSelectedNodeId(nodeId);
  }, []);

  // Guard (after all hooks): unknown pathId — clean not-found state, no misleading skeleton
  if (!knownPath) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: colors.bgApp }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle size={32} color={colors.textDim} strokeWidth={1.5} />
          <p className="font-['Inter',sans-serif] text-[14px]" style={{ color: colors.textPrimary }}>
            Attack path not found
          </p>
          <p className="font-['Inter',sans-serif] text-[12px]" style={{ color: colors.textDim }}>
            Path <code style={{ color: colors.accent, fontFamily: "monospace" }}>{pathId}</code> does not exist.
          </p>
          <button
            onClick={() => navigate("/attack-paths")}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] transition-colors cursor-pointer"
            style={{ backgroundColor: `${colors.accent}14`, border: `1px solid ${colors.accent}30`, color: colors.accent }}
          >
            <ArrowLeft size={12} /> Back to Attack Paths
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen" style={{ backgroundColor: colors.bgApp }}>
      {/* Header — sticky context bar */}
      <div className="shrink-0 sticky top-0 z-[50] flex items-center gap-3 px-5 py-2 border-b" style={{ borderColor: colors.border, backgroundColor: colors.bgApp }}>
        <button
          onClick={() => navigate('/attack-paths')}
          className="flex items-center justify-center w-7 h-7 rounded-lg border transition-colors hover:bg-[rgba(87,177,255,0.08)]"
          style={{ borderColor: colors.border }}
          aria-label="Back to Attack Paths"
        >
          <ArrowLeft size={14} color={colors.textMuted} />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/attack-paths')}
            className="text-[13px] transition-colors hover:text-white"
            style={{ color: colors.textDim, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
          >
            Attack Paths
          </button>
          <span className="text-[12px]" style={{ color: colors.textDim }}>/</span>
          <span className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>{pathData.name}</span>
        </div>
        <Badge tone={pathData.priority} size="sm">{pathData.priority}</Badge>
        <div className="ml-auto flex items-center gap-5">
          <MetricPill label="Assets" value={pathData.assets} color="#57b1ff" />
          <MetricPill label="Misconfigs" value={pathData.misconfigurations} color="#FF740A" />
          <MetricPill label="Vulns" value={pathData.vulnerabilities} color="#FF5757" />
        </div>
        <button
          onClick={() => {
            import("./case-management/case-integration").then(({ createCaseFromAttackPath }) => {
              import("./case-management/case-data").then(({ addCase, addObservation, addPlaybooks }) => {
                const vulnNode = pathData.nodes.find(n => n.isVulnerable);
                const context = {
                  attackPathId: resolvedPathId,
                  attackPathName: pathData.name,
                  attackPathDescription: pathData.description,
                  priority: pathData.priority,
                  vulnerabilityCount: pathData.vulnerabilities,
                  misconfigurationCount: pathData.misconfigurations,
                  vulnerabilityId: vulnNode?.cve,
                  blastRadiusAssets: pathData.blastRadius.totalAssets,
                };
                const { caseData, initialObservation, recommendedPlaybooks } = createCaseFromAttackPath(context);
                addCase(caseData);
                addObservation(caseData.id, initialObservation);
                addPlaybooks(caseData.id, recommendedPlaybooks);
                navigate(`/case-management/${caseData.id}`, {
                  state: { fromAI: true, fromAttackPath: true, attackPathReturnPath: `/attack-paths/${resolvedPathId}`, initialTab: "investigation", caseData, initialObservation, recommendedPlaybooks },
                });
              });
            });
          }}
          className="flex items-center gap-2 px-3 h-8 rounded-lg border text-[12px] font-semibold transition-all hover:bg-[rgba(240,91,6,0.10)]"
          style={{ borderColor: "rgba(240,91,6,0.35)", color: "#F05B06" }}
        >
          <FileText size={13} strokeWidth={2} />
          Create Case
        </button>
      </div>

      {/* Main content: Full-width Graph canvas */}
      <div className="flex-1 flex flex-col p-2 overflow-hidden" style={{ minHeight: 0 }}>
        <GraphCanvas pathData={pathData} pathId={resolvedPathId} selectedNodeId={selectedNodeId} onSelectNode={handleSelectNode} />
        {/* Graph exploration hint */}
        <div className="shrink-0 flex items-center justify-center gap-[20px] py-[8px] px-4">
          <span className="text-[10px] font-['Inter',sans-serif] tracking-[0.01em]" style={{ color: colors.textMuted }}>
            <span style={{ color: colors.accent, fontWeight: 600 }}>Click any node</span> to inspect its CVE and exposure details
            <span style={{ color: colors.textDim, margin: "0 8px" }}>·</span>
            <span style={{ color: colors.accent, fontWeight: 600 }}>Hover the blast radius pill</span> to see all exposed assets
            <span style={{ color: colors.textDim, margin: "0 8px" }}>·</span>
            <span style={{ color: colors.accent, fontWeight: 600 }}>Ask AI</span> to walk through each hop in plain language
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   METRIC PILL (header)
   ================================================================ */

function MetricPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[10px] uppercase tracking-wider" style={{ color: colors.textDim }}>{label}</span>
      <span className="text-[13px] font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}