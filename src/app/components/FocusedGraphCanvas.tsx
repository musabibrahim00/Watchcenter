/**
 * Focused Graph Canvas
 * ====================
 *
 * Wraps the useIncrementalGraph hook with an SVG rendering layer.
 * - Starts from a single focus node (only that node is loaded initially)
 * - Fetches first-degree relationships on mount
 * - On-demand expansion fetches next-level neighborhoods
 * - Caps visible nodes at 30, shows "+N more" collapsed indicators
 * - Shows compressed-path indicators for hidden intermediates
 * - NEVER loads the full graph dataset — always incremental
 *
 * Performance optimisations (v2):
 *  • MemoizedEdge — pure SVG <line>, re-renders only on endpoint or structure change
 *  • MemoizedNode — React.memo wrapper; re-renders only when selected/expanded state changes
 *  • useStablePositions — position Map reference stays identical when layout is unchanged
 *  • useViewportCull — >30 visible nodes → only those in the viewport are mounted
 *  • Hover is NOT tracked via React state; no full rerender on pointer move
 *  • Cached graph queries — GraphDataStore caches all fetched neighborhoods
 *
 * Node styles/colors are NOT changed — delegated to parent via render props.
 */

import React, { useMemo, useCallback } from "react";
import { Plus, Minus } from "lucide-react";
import { colors } from "../shared/design-system/tokens";
import { useIncrementalGraph } from "../shared/graph/useIncrementalGraph";
import {
  useStablePositions,
  useViewportCull,
  screenToGraphViewport,
} from "../shared/graph/perf-utils";
import type { ViewportRect } from "../shared/graph/perf-utils";

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */

export interface FGNode {
  id: string;
  type: string;
  label: string;
  sublabel?: string;
  severity?: string;
  /** Original (unused) x/y — layout is computed dynamically. */
  x: number;
  y: number;
  [key: string]: unknown;
}

export interface FGEdge {
  from: string;
  to: string;
  label?: string;
  [key: string]: unknown;
}

export interface FocusedGraphCanvasProps {
  /** Full set of nodes in the graph. */
  allNodes: FGNode[];
  /** Full set of edges in the graph. */
  allEdges: FGEdge[];
  /** Which node to focus on initially. */
  initialFocusId: string;
  /** Currently selected node (for highlight ring). */
  selectedNodeId: string | null;
  /** Called when user clicks a node. */
  onSelectNode: (nodeId: string) => void;
  /** Render delegate for a single node (receives computed x/y). */
  renderNode: (node: FGNode, x: number, y: number, isSelected: boolean) => React.ReactNode;
  /** Color accessor per node type (for edge/indicator coloring). */
  getNodeColor: (type: string, severity?: string) => string;
  /** Label accessor per node type. */
  getTypeLabel: (type: string) => string;
  /** Current zoom scale (passed through from parent). */
  scale: number;
  /** Current pan offset (passed through from parent). */
  offset: { x: number; y: number };
  /** Container width for viewport culling (optional). */
  containerWidth?: number;
  /** Container height for viewport culling (optional). */
  containerHeight?: number;
}

/* ═══════════════════════════════════════════════════════════
   LAYOUT ENGINE — radial rings around focus
   ═══════════════════════════════════════════════════════════ */

const CX = 600;
const CY = 300;
const R1 = 180;
const R2 = 340;

function computePositions(
  visibleNodes: FGNode[],
  visibleEdges: FGEdge[],
  focusId: string | null,
): Map<string, { x: number; y: number }> {
  const pos = new Map<string, { x: number; y: number }>();
  if (!focusId || visibleNodes.length === 0) return pos;

  // Focus at center
  pos.set(focusId, { x: CX, y: CY });

  // Ring 1: direct neighbors
  const neighborIds = new Set<string>();
  for (const e of visibleEdges) {
    if (e.from === focusId) neighborIds.add(e.to);
    if (e.to === focusId) neighborIds.add(e.from);
  }
  const ring1 = visibleNodes.filter((n) => n.id !== focusId && neighborIds.has(n.id));
  ring1.forEach((n, i) => {
    const a = (2 * Math.PI * i) / Math.max(ring1.length, 1) - Math.PI / 2;
    pos.set(n.id, { x: CX + Math.cos(a) * R1, y: CY + Math.sin(a) * R1 });
  });

  // Ring 2: everyone else
  const ring2 = visibleNodes.filter((n) => n.id !== focusId && !neighborIds.has(n.id));
  ring2.forEach((n, i) => {
    const a = (2 * Math.PI * i) / Math.max(ring2.length, 1) - Math.PI / 2;
    pos.set(n.id, { x: CX + Math.cos(a) * R2, y: CY + Math.sin(a) * R2 });
  });

  return pos;
}

/* ═══════════════════════════════════════════════════════════
   TYPE LABEL LOOKUP
   ═══════════════════════════════════════════════════════════ */

const PLURAL: Record<string, string> = {
  asset: "assets",
  vulnerability: "vulnerabilities",
  "attack-path": "attack paths",
  risk: "risks",
  case: "cases",
  workflow: "workflows",
};

/* ═══════════════════════════════════════════════════════════
   MEMOIZED EDGE — lightweight SVG path, only re-renders
   when structure changes (endpoint coordinates or label).
   ═══════════════════════════════════════════════════════════ */

interface MemoEdgeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
}

const MemoizedEdge = React.memo(function MemoizedEdge({
  x1, y1, x2, y2, label,
}: MemoEdgeProps) {
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={colors.border}
        strokeWidth={2}
        markerEnd="url(#fg-arrow)"
      />
      {label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 10}
          textAnchor="middle"
          fontSize={9}
          fill={colors.textMuted}
        >
          {label}
        </text>
      )}
    </g>
  );
});

/* ═══════════════════════════════════════════════════════════
   MEMOIZED NODE WRAPPER — only re-renders when:
     • selected state changes
     • expanded state changes
     • position changes
   Hover does NOT trigger a re-render.
   ═══════════════════════════════════════════════════════════ */

interface MemoNodeProps {
  node: FGNode;
  x: number;
  y: number;
  isSelected: boolean;
  isExpanded: boolean;
  isFocus: boolean;
  renderNode: (node: FGNode, x: number, y: number, isSelected: boolean) => React.ReactNode;
  onClick: (nodeId: string) => void;
  onExpand: (nodeId: string) => void;
  onCollapse: (nodeId: string) => void;
}

const MemoizedNode = React.memo(
  function MemoizedNode({
    node, x, y, isSelected, isExpanded, isFocus,
    renderNode, onClick, onExpand, onCollapse,
  }: MemoNodeProps) {
    return (
      <g
        onClick={() => onClick(node.id)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          isExpanded ? onCollapse(node.id) : onExpand(node.id);
        }}
      >
        {renderNode(node, x, y, isSelected)}
        {/* Expand / Collapse badge */}
        {!isFocus && (
          <g
            transform={`translate(${x + 22}, ${y - 22})`}
            onClick={(e) => {
              e.stopPropagation();
              isExpanded ? onCollapse(node.id) : onExpand(node.id);
            }}
            style={{ cursor: "pointer" }}
          >
            <circle
              cx={0}
              cy={0}
              r={10}
              fill={colors.bgCard}
              stroke={isExpanded ? colors.accent : colors.border}
              strokeWidth={1.5}
            />
            <g transform="translate(-5, -5)">
              <foreignObject width={10} height={10}>
                {isExpanded ? (
                  <Minus size={10} color={colors.accent} strokeWidth={2.5} />
                ) : (
                  <Plus size={10} color={colors.textMuted} strokeWidth={2.5} />
                )}
              </foreignObject>
            </g>
          </g>
        )}
      </g>
    );
  },
  // Custom areEqual — skip re-render when only irrelevant props changed
  (prev, next) => {
    return (
      prev.node.id === next.node.id &&
      prev.x === next.x &&
      prev.y === next.y &&
      prev.isSelected === next.isSelected &&
      prev.isExpanded === next.isExpanded &&
      prev.isFocus === next.isFocus &&
      prev.renderNode === next.renderNode
    );
  },
);

/* ═══════════════════════════════════════════════════════════
   MEMOIZED COMPRESSED PATH INDICATOR
   ═══════════════════════════════════════════════════════════ */

interface MemoCompressedPathProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  count: number;
  onExpand: () => void;
}

const MemoizedCompressedPath = React.memo(function MemoizedCompressedPath({
  fromX, fromY, toX, toY, count, onExpand,
}: MemoCompressedPathProps) {
  const mx = (fromX + toX) / 2;
  const my = (fromY + toY) / 2;
  return (
    <g onClick={(e) => { e.stopPropagation(); onExpand(); }} style={{ cursor: "pointer" }}>
      <line
        x1={fromX} y1={fromY} x2={toX} y2={toY}
        stroke={colors.accent}
        strokeWidth={1.5}
        strokeDasharray="6 4"
        opacity={0.5}
      />
      <rect
        x={mx - 60} y={my - 12} width={120} height={24} rx={12}
        fill={colors.bgCard} stroke={colors.accent} strokeWidth={1} opacity={0.95}
      />
      <text
        x={mx} y={my + 4} textAnchor="middle"
        fontSize={10} fontWeight={600} fill={colors.accent}
      >
        +{count} intermediate {count === 1 ? "node" : "nodes"}
      </text>
    </g>
  );
});

/* ═══════════════════════════════════════════════════════════
   MEMOIZED COLLAPSED GROUP PILL
   ═══════════════════════════════════════════════════════════ */

interface MemoCollapsedGroupProps {
  pillX: number;
  pillY: number;
  typeColor: string;
  count: number;
  label: string;
  onExpand: () => void;
}

const MemoizedCollapsedGroup = React.memo(function MemoizedCollapsedGroup({
  pillX, pillY, typeColor, count, label, onExpand,
}: MemoCollapsedGroupProps) {
  return (
    <g onClick={(e) => { e.stopPropagation(); onExpand(); }} style={{ cursor: "pointer" }}>
      <rect
        x={pillX - 72} y={pillY - 11} width={144} height={22} rx={11}
        fill={colors.bgCard} stroke={typeColor} strokeWidth={1} opacity={0.92}
      />
      <text
        x={pillX} y={pillY + 4} textAnchor="middle"
        fontSize={10} fontWeight={600} fill={typeColor}
      >
        +{count} more {label}
      </text>
    </g>
  );
});

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

export function FocusedGraphCanvas({
  allNodes,
  allEdges,
  initialFocusId,
  selectedNodeId,
  onSelectNode,
  renderNode,
  getNodeColor: colorFn,
  getTypeLabel: labelFn,
  scale,
  offset,
  containerWidth = 1200,
  containerHeight = 800,
}: FocusedGraphCanvasProps) {
  const focused = useIncrementalGraph<FGNode, FGEdge>(allNodes, allEdges, initialFocusId, {
    maxVisible: 30,
    getNodeType: (n) => n.type,
    getTypeLabel: (t) => PLURAL[t] ?? `${t}s`,
  });

  // ── Stable layout positions (only recomputes when graph structure changes) ──
  const positions = useStablePositions(
    () => computePositions(focused.visibleNodes, focused.visibleEdges, focused.focusNodeId),
    [focused.visibleNodes, focused.visibleEdges, focused.focusNodeId],
  );

  // ── Viewport culling for large graphs ──
  const viewport: ViewportRect | null = useMemo(() => {
    if (focused.visibleNodes.length <= 30) return null;
    return screenToGraphViewport(containerWidth, containerHeight, offset.x, offset.y, scale);
  }, [containerWidth, containerHeight, offset.x, offset.y, scale, focused.visibleNodes.length]);

  const culledNodes = useViewportCull(focused.visibleNodes, positions, viewport, 30);

  // ── Stable callback refs ──
  const handleNodeClick = useCallback(
    (nodeId: string) => { onSelectNode(nodeId); },
    [onSelectNode],
  );

  const expandNode = useCallback(
    (nodeId: string) => { focused.expandNode(nodeId); },
    [focused.expandNode],
  );

  const collapseNode = useCallback(
    (nodeId: string) => { focused.collapseNode(nodeId); },
    [focused.collapseNode],
  );

  // ── Precompute expand state set for quick lookup ──
  const expandedSet = focused.expandedIds;

  // ── Memoize edge render data (only recomputes when visible edges/positions change) ──
  const edgeRenderData = useMemo(() => {
    return focused.visibleEdges
      .map((edge, i) => {
        const fp = positions.get(edge.from);
        const tp = positions.get(edge.to);
        if (!fp || !tp) return null;
        return { key: `e-${edge.from}-${edge.to}`, x1: fp.x, y1: fp.y, x2: tp.x, y2: tp.y, label: edge.label };
      })
      .filter(Boolean) as Array<{ key: string; x1: number; y1: number; x2: number; y2: number; label?: string }>;
  }, [focused.visibleEdges, positions]);

  // ── Memoize compressed path data ──
  const compressedPathData = useMemo(() => {
    return focused.compressedPaths
      .map((cp) => {
        const fp = positions.get(cp.fromId);
        const tp = positions.get(cp.toId);
        if (!fp || !tp) return null;
        return { key: `cp-${cp.fromId}-${cp.toId}`, fromX: fp.x, fromY: fp.y, toX: tp.x, toY: tp.y, count: cp.intermediateCount, fromId: cp.fromId, toId: cp.toId };
      })
      .filter(Boolean) as Array<{ key: string; fromX: number; fromY: number; toX: number; toY: number; count: number; fromId: string; toId: string }>;
  }, [focused.compressedPaths, positions]);

  // ── Memoize collapsed group data ──
  const collapsedGroupData = useMemo(() => {
    return focused.collapsedGroups
      .map((group, i) => {
        const parentPos = positions.get(group.parentNodeId);
        if (!parentPos) return null;
        return {
          key: `cg-${group.parentNodeId}-${group.type}`,
          pillX: parentPos.x,
          pillY: parentPos.y + 75 + i * 28,
          typeColor: colorFn(group.type),
          count: group.count,
          label: group.label,
          parentNodeId: group.parentNodeId,
          type: group.type,
        };
      })
      .filter(Boolean) as Array<{ key: string; pillX: number; pillY: number; typeColor: string; count: number; label: string; parentNodeId: string; type: string }>;
  }, [focused.collapsedGroups, positions, colorFn]);

  // ── Focus label (avoid searching every render) ──
  const focusLabel = useMemo(
    () => allNodes.find((n) => n.id === focused.focusNodeId)?.label ?? focused.focusNodeId,
    [allNodes, focused.focusNodeId],
  );

  return (
    <>
      {/* ── SVG graph layer ── */}
      <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
        {/* Arrowhead marker */}
        <defs>
          <marker id="fg-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill={colors.border} />
          </marker>
        </defs>

        {/* ── Edges (memoized) ── */}
        {edgeRenderData.map((ed) => (
          <MemoizedEdge key={ed.key} x1={ed.x1} y1={ed.y1} x2={ed.x2} y2={ed.y2} label={ed.label} />
        ))}

        {/* ── Compressed path indicators (memoized) ── */}
        {compressedPathData.map((cp) => (
          <MemoizedCompressedPath
            key={cp.key}
            fromX={cp.fromX}
            fromY={cp.fromY}
            toX={cp.toX}
            toY={cp.toY}
            count={cp.count}
            onExpand={() => focused.expandCompressedPath(cp.fromId, cp.toId)}
          />
        ))}

        {/* ── Nodes (memoized + viewport-culled) ── */}
        {culledNodes.map((node) => {
          const p = positions.get(node.id);
          if (!p) return null;
          return (
            <MemoizedNode
              key={node.id}
              node={node}
              x={p.x}
              y={p.y}
              isSelected={selectedNodeId === node.id}
              isExpanded={expandedSet.has(node.id)}
              isFocus={node.id === focused.focusNodeId}
              renderNode={renderNode}
              onClick={handleNodeClick}
              onExpand={expandNode}
              onCollapse={collapseNode}
            />
          );
        })}

        {/* ── Collapsed group indicators (memoized) ── */}
        {collapsedGroupData.map((cg) => (
          <MemoizedCollapsedGroup
            key={cg.key}
            pillX={cg.pillX}
            pillY={cg.pillY}
            typeColor={cg.typeColor}
            count={cg.count}
            label={cg.label}
            onExpand={() => focused.expandCollapsedGroup(cg.parentNodeId, cg.type)}
          />
        ))}
      </g>

      {/* ── Status bar (HTML overlay) ── */}
      <foreignObject x={0} y={0} width="100%" height="100%" style={{ pointerEvents: "none", overflow: "visible" }}>
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            pointerEvents: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "flex-end",
          }}
        >
          {/* Node count badge */}
          <div
            style={{
              backgroundColor: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <span style={{ color: colors.textMuted, fontSize: 11 }}>
              Showing {focused.visibleNodes.length} of {focused.totalBackingCount} nodes
              {focused.loadedCount !== focused.totalBackingCount && (
                <> ({focused.loadedCount} loaded)</>
              )}
            </span>
            {focused.totalUncappedCount > focused.visibleNodes.length && (
              <span
                style={{
                  color: colors.accent,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                ({focused.totalUncappedCount - focused.visibleNodes.length} hidden)
              </span>
            )}
          </div>

          {/* Focus indicator */}
          {focused.focusNodeId && (
            <div
              style={{
                backgroundColor: colors.bgCard,
                border: `1px solid ${colors.accent}40`,
                borderRadius: 8,
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: colors.accent,
                }}
              />
              <span style={{ color: colors.textSecondary, fontSize: 11 }}>
                Focused on:{" "}
                <strong style={{ color: colors.textPrimary }}>
                  {focusLabel}
                </strong>
              </span>
              <button
                onClick={() => focused.reset()}
                style={{
                  background: "none",
                  border: "none",
                  color: colors.accent,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </foreignObject>
    </>
  );
}