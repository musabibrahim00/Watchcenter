import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAiBox } from "../../features/ai-box";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis,
  Tooltip, Cell, PieChart, Pie,
} from "recharts";
import {
  ChevronDown, ArrowUpDown, ChevronLeft, ChevronRight, Network,
  Info, Share2, MoreVertical, Pencil, Trash2, Clock, Plus, X, Check,
} from "lucide-react";
import { colors } from "../../shared/design-system/tokens";
import { DeferredChart } from "../../shared/components/DeferredChart";
import { EntityLink } from "../../shared/components/EntityLink";
import {
  ASSETS, KPI_DATA, INVENTORY_TREND, TYPE_DISTRIBUTION, RISK_INDICATORS,
  type Asset,
} from "./asset-data";

/* ================================================================
   FILTER TYPES & CONFIG
   ================================================================ */

export type FilterOperator = "is" | "is not" | "contains" | "starts with" | "in list";

export interface ActiveFilter {
  id: string;
  field: FilterFieldKey;
  operator: FilterOperator;
  value: string; // For "in list" operator, comma-separated
}

type FilterFieldKey =
  | "securityPlane"
  | "vendor"
  | "accountName"
  | "assetType"
  | "assetGroup"
  | "region"
  | "service"
  | "severity"
  | "owner"
  | "custodian";

interface FilterFieldDef {
  key: FilterFieldKey;
  label: string;
  accessor: (a: Asset) => string;
}

const FILTER_FIELDS: FilterFieldDef[] = [
  { key: "securityPlane", label: "Plane", accessor: a => a.securityPlane },
  { key: "vendor", label: "Vendor", accessor: a => a.vendor },
  { key: "accountName", label: "Account", accessor: a => a.accountName },
  { key: "assetType", label: "Resource Type", accessor: a => a.assetType },
  { key: "assetGroup", label: "Asset Type", accessor: a => a.assetGroup },
  { key: "region", label: "Region", accessor: a => a.region },
  { key: "service", label: "Service", accessor: a => a.service },
  { key: "severity", label: "Severity", accessor: a => a.severity },
  { key: "owner", label: "Owner", accessor: a => a.owner || "(Unassigned)" },
  { key: "custodian", label: "Custodian", accessor: a => a.custodian || "(Unassigned)" },
];

const ALL_OPERATORS: FilterOperator[] = ["is", "is not", "contains", "starts with", "in list"];

function getFieldDef(key: FilterFieldKey): FilterFieldDef {
  return FILTER_FIELDS.find(f => f.key === key)!;
}

/** Get unique values for a given field from the dataset */
function getFieldValues(field: FilterFieldKey): string[] {
  const def = getFieldDef(field);
  const vals = new Set(ASSETS.map(a => def.accessor(a)));
  return Array.from(vals).sort();
}

/** Apply a single filter to an asset */
function matchesFilter(asset: Asset, filter: ActiveFilter): boolean {
  const def = getFieldDef(filter.field);
  const val = def.accessor(asset).toLowerCase();
  const fval = filter.value.toLowerCase();

  switch (filter.operator) {
    case "is":
      return filter.value === "All" || val === fval;
    case "is not":
      return val !== fval;
    case "contains":
      return val.includes(fval);
    case "starts with":
      return val.startsWith(fval);
    case "in list": {
      const items = filter.value.split(",").map(s => s.trim().toLowerCase());
      return items.includes(val);
    }
    default:
      return true;
  }
}

/** Apply all filters (AND logic) */
function applyFilters(assets: Asset[], filters: ActiveFilter[]): Asset[] {
  if (filters.length === 0) return assets;
  return assets.filter(a => filters.every(f => matchesFilter(a, f)));
}

let filterIdCounter = 0;
function nextFilterId() {
  return `f-${++filterIdCounter}`;
}

/* ================================================================
   CONSTANTS
   ================================================================ */

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "register", label: "Asset Register" },
  { id: "security", label: "Security Diagram" },
  { id: "infra", label: "Infrastructure Security Diagram" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const PAGE_SIZE = 10;

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export default function AssetRegisterPage() {
  const { setPageContext } = useAiBox();

  useEffect(() => {
    setPageContext({
      type: "asset",
      label: "Asset Register",
      sublabel: "Inventory",
      contextKey: "asset-register",
      suggestions: [
        { label: "What changed since my last visit?", prompt: "What changed in the asset register since my last visit?" },
        { label: "Show high-risk assets", prompt: "Show me all high and critical risk assets in the current view" },
        { label: "Assess exposure", prompt: "Which assets have the highest exposure risk right now?" },
        { label: "Show open findings", prompt: "Show me assets with open security findings" },
        { label: "Recommend patches", prompt: "Which assets should be patched first based on current risk?" },
        { label: "List misconfigurations", prompt: "List assets with active misconfigurations" },
      ],
      greeting: "I have visibility into your asset inventory. What would you like to investigate?",
    });
  }, [setPageContext]);

  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  /* ── Filter state ── */
  const [filters, setFilters] = useState<ActiveFilter[]>([
    { id: nextFilterId(), field: "securityPlane", operator: "is", value: "Cloud" },
    { id: nextFilterId(), field: "vendor", operator: "is", value: "AWS" },
    { id: nextFilterId(), field: "accountName", operator: "is", value: "Prod-Primary-AWS" },
    { id: nextFilterId(), field: "assetType", operator: "is", value: "All" },
  ]);

  const filteredAssets = useMemo(() => applyFilters(ASSETS, filters), [filters]);

  const updateFilter = useCallback((id: string, patch: Partial<Omit<ActiveFilter, "id">>) => {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  }, []);

  const removeFilter = useCallback((id: string) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  const addFilter = useCallback((field: FilterFieldKey) => {
    const vals = getFieldValues(field);
    setFilters(prev => [
      ...prev,
      { id: nextFilterId(), field, operator: "is" as FilterOperator, value: vals[0] || "All" },
    ]);
  }, []);

  /* ── Computed KPIs based on filtered data ── */
  const computedKpi = useMemo(() => {
    const total = filteredAssets.length;
    const highRisk = filteredAssets.filter(a => a.severity === "critical" || a.severity === "high").length;
    const withOwner = filteredAssets.filter(a => a.owner !== "").length;
    const ownerPct = total > 0 ? Math.round((withOwner / total) * 100) : 0;
    const classifiedCount = filteredAssets.filter(a => a.ciaC + a.ciaI + a.ciaA > 0).length;
    const classPct = total > 0 ? Math.round((classifiedCount / total) * 100) : 0;
    const newCount = Math.min(total, KPI_DATA.newlyAdded);
    return {
      totalAssets: total,
      newlyAdded: newCount,
      ownershipCoverage: ownerPct,
      ownershipDelta: KPI_DATA.ownershipDelta,
      classificationCoverage: classPct,
      classificationDelta: KPI_DATA.classificationDelta,
      highRiskAssets: highRisk,
      highRiskDelta: KPI_DATA.highRiskDelta,
    };
  }, [filteredAssets]);

  /* ── Computed type distribution for filtered data ── */
  const computedTypeDist = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAssets.forEach(a => {
      const t = a.assetType;
      counts[t] = (counts[t] || 0) + 1;
    });
    const colorMap: Record<string, string> = {
      Servers: colors.critical, Data: colors.high, Cloud: colors.medium, Endpoints: "#5b6abf", Network: colors.active,
    };
    return Object.entries(counts).map(([type, count]) => ({
      type, count, color: colorMap[type] || colors.info,
    }));
  }, [filteredAssets]);

  /* ── Computed risk indicators for filtered data ── */
  const computedRiskIndicators = useMemo(() => {
    const critVuln = filteredAssets.filter(a => a.severity === "critical" && a.vulnerabilityCount > 0).length;
    const withMisconfig = filteredAssets.filter(a => a.misconfigurationCount > 0).length;
    const exposed = filteredAssets.filter(a => a.riskScore > 5).length;
    const inKev = filteredAssets.filter(a => a.riskScore > 7).length;
    return [
      { label: "Assets with Critical Vulnerabilities", count: critVuln },
      { label: "Assets with Misconfigurations", count: withMisconfig },
      { label: "Externally Exposed Assets", count: exposed },
      { label: "Assets in KEV Attack Paths", count: inKev },
    ];
  }, [filteredAssets]);

  return (
    <div className="flex flex-col h-full min-h-screen" style={{ backgroundColor: colors.bgApp, maxWidth: "100%", overflowX: "hidden" }}>
      {/* ── Page Header ── */}
      <div className="shrink-0 px-6 pt-5 pb-0">
        {/* Title */}
        <h1 className="text-[20px] tracking-tight mb-5" style={{ color: colors.textPrimary, fontWeight: 700 }}>
          Asset Register
        </h1>

        {/* ── Advanced Filter Bar ── */}
        <AdvancedFilterBar
          filters={filters}
          onUpdate={updateFilter}
          onRemove={removeFilter}
          onAdd={addFilter}
        />

        {/* ── Tab Bar ── */}
        <div className="flex items-center gap-0" style={{ borderBottom: `1px solid ${colors.border}` }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="px-4 py-2.5 text-[13px] transition-colors relative"
                style={{
                  color: isActive ? colors.textPrimary : colors.textDim,
                  fontWeight: isActive ? 600 : 400,
                  background: "none", border: "none", cursor: "pointer",
                }}>
                {tab.label}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: colors.textPrimary }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(87,177,255,0.12) transparent" }}>
        {activeTab === "dashboard" && (
          <DashboardView kpi={computedKpi} typeDist={computedTypeDist} riskIndicators={computedRiskIndicators} />
        )}
        {activeTab === "register" && <RegisterListView filteredAssets={filteredAssets} />}
        {activeTab === "security" && <PlaceholderTab label="Security Diagram" />}
        {activeTab === "infra" && <PlaceholderTab label="Infrastructure Security Diagram" />}
      </div>
    </div>
  );
}

/* ================================================================
   ADVANCED FILTER BAR
   ================================================================ */

function AdvancedFilterBar({ filters, onUpdate, onRemove, onAdd }: {
  filters: ActiveFilter[];
  onUpdate: (id: string, patch: Partial<Omit<ActiveFilter, "id">>) => void;
  onRemove: (id: string) => void;
  onAdd: (field: FilterFieldKey) => void;
}) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  /* close "add" menu on outside click */
  useEffect(() => {
    if (!addMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (addMenuRef.current?.contains(e.target as Node)) return;
      if (addBtnRef.current?.contains(e.target as Node)) return;
      setAddMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [addMenuOpen]);

  /* Determine which fields are already in use */
  const usedFields = new Set(filters.map(f => f.field));

  return (
    <div className="flex items-center gap-2 mb-4 flex-wrap" style={{ minHeight: 36 }}>
      <span style={{ fontSize: 12, color: colors.textDim, marginRight: 4 }}>Filtered by:</span>

      {filters.map((f, idx) => (
        <EditableFilterChip
          key={f.id}
          filter={f}
          isFirst={idx === 0}
          onUpdate={(patch) => onUpdate(f.id, patch)}
          onRemove={() => onRemove(f.id)}
        />
      ))}

      {/* ── Add Filter Button ── */}
      <div style={{ position: "relative" }}>
        <button
          ref={addBtnRef}
          onClick={() => setAddMenuOpen(o => !o)}
          className="flex items-center gap-1.5 px-3 py-[5px] rounded-[4px] transition-colors"
          style={{
            backgroundColor: "transparent",
            border: `1px dashed ${colors.border}`,
            cursor: "pointer",
            color: colors.textDim,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = colors.borderHover; e.currentTarget.style.color = colors.textSecondary; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.color = colors.textDim; }}
        >
          <Plus size={12} />
          <span style={{ fontSize: 12 }}>Add Filter</span>
        </button>

        {addMenuOpen && (
          <div
            ref={addMenuRef}
            style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200,
              minWidth: 180, backgroundColor: colors.bgCard,
              border: `1px solid ${colors.border}`, borderRadius: 6,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              padding: "4px 0",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(87,177,255,0.12) transparent",
            }}
          >
            {FILTER_FIELDS.filter(fd => !usedFields.has(fd.key)).map(fd => (
              <button
                key={fd.key}
                onClick={() => { onAdd(fd.key); setAddMenuOpen(false); }}
                className="flex items-center w-full px-3 py-2 text-left transition-colors"
                style={{ fontSize: 12, color: colors.textSecondary, background: "none", border: "none", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.08)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {fd.label}
              </button>
            ))}
            {FILTER_FIELDS.filter(fd => !usedFields.has(fd.key)).length === 0 && (
              <div className="px-3 py-2" style={{ fontSize: 11, color: colors.textDim }}>All fields added</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   EDITABLE FILTER CHIP
   ================================================================ */

type ChipEditSection = "field" | "operator" | "value" | null;

function EditableFilterChip({ filter, isFirst, onUpdate, onRemove }: {
  filter: ActiveFilter;
  isFirst: boolean;
  onUpdate: (patch: Partial<Omit<ActiveFilter, "id">>) => void;
  onRemove: () => void;
}) {
  const [editSection, setEditSection] = useState<ChipEditSection>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fieldDef = getFieldDef(filter.field);
  const fieldValues = useMemo(() => ["All", ...getFieldValues(filter.field)], [filter.field]);

  /* close dropdown on outside click */
  useEffect(() => {
    if (!editSection) return;
    const handler = (e: MouseEvent) => {
      if (chipRef.current?.contains(e.target as Node)) return;
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setEditSection(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [editSection]);

  const handleFieldChange = useCallback((newField: FilterFieldKey) => {
    const vals = getFieldValues(newField);
    onUpdate({ field: newField, value: vals[0] || "All" });
    setEditSection(null);
  }, [onUpdate]);

  const handleOperatorChange = useCallback((op: FilterOperator) => {
    onUpdate({ operator: op });
    setEditSection(null);
  }, [onUpdate]);

  const handleValueChange = useCallback((val: string) => {
    onUpdate({ value: val });
    setEditSection(null);
  }, [onUpdate]);

  return (
    <div ref={chipRef} style={{ position: "relative" }}>
      <div
        className="flex items-center gap-0 rounded-[4px]"
        style={{
          backgroundColor: isFirst ? colors.buttonPrimary : "rgba(87,177,255,0.06)",
          border: `1px solid ${isFirst ? colors.buttonPrimary : colors.border}`,
          overflow: "hidden",
        }}
      >
        {/* Field segment */}
        <button
          onClick={() => setEditSection(s => s === "field" ? null : "field")}
          className="flex items-center gap-1 px-2.5 py-[5px] transition-colors"
          style={{
            fontSize: 12, color: isFirst ? "#fff" : colors.textSecondary,
            background: editSection === "field" ? "rgba(87,177,255,0.12)" : "none",
            border: "none", cursor: "pointer",
            borderRight: `1px solid ${isFirst ? "rgba(255,255,255,0.15)" : "rgba(87,177,255,0.10)"}`,
          }}
          onMouseEnter={e => { if (editSection !== "field") e.currentTarget.style.background = "rgba(87,177,255,0.08)"; }}
          onMouseLeave={e => { if (editSection !== "field") e.currentTarget.style.background = "none"; }}
        >
          {fieldDef.label}
        </button>

        {/* Operator segment */}
        <button
          onClick={() => setEditSection(s => s === "operator" ? null : "operator")}
          className="flex items-center gap-1 px-2 py-[5px] transition-colors"
          style={{
            fontSize: 12, color: isFirst ? "rgba(255,255,255,0.6)" : colors.textDim,
            background: editSection === "operator" ? "rgba(87,177,255,0.12)" : "none",
            border: "none", cursor: "pointer",
            borderRight: `1px solid ${isFirst ? "rgba(255,255,255,0.15)" : "rgba(87,177,255,0.10)"}`,
          }}
          onMouseEnter={e => { if (editSection !== "operator") e.currentTarget.style.background = "rgba(87,177,255,0.08)"; }}
          onMouseLeave={e => { if (editSection !== "operator") e.currentTarget.style.background = "none"; }}
        >
          {filter.operator}
        </button>

        {/* Value segment */}
        <button
          onClick={() => setEditSection(s => s === "value" ? null : "value")}
          className="flex items-center gap-1 px-2.5 py-[5px] transition-colors"
          style={{
            fontSize: 12, fontWeight: 500, color: isFirst ? "#fff" : colors.textPrimary,
            background: editSection === "value" ? "rgba(87,177,255,0.12)" : "none",
            border: "none", cursor: "pointer",
          }}
          onMouseEnter={e => { if (editSection !== "value") e.currentTarget.style.background = "rgba(87,177,255,0.08)"; }}
          onMouseLeave={e => { if (editSection !== "value") e.currentTarget.style.background = "none"; }}
        >
          {filter.value}
          <ChevronDown size={10} style={{ opacity: 0.6, marginLeft: 2 }} />
        </button>

        {/* Remove button */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="flex items-center justify-center px-1.5 py-[5px] transition-colors"
          style={{
            background: "none", border: "none", cursor: "pointer",
            borderLeft: `1px solid ${isFirst ? "rgba(255,255,255,0.15)" : "rgba(87,177,255,0.10)"}`,
            color: isFirst ? "rgba(255,255,255,0.5)" : colors.textDim,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = colors.danger; e.currentTarget.style.background = "rgba(255,95,86,0.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = isFirst ? "rgba(255,255,255,0.5)" : colors.textDim; e.currentTarget.style.background = "none"; }}
        >
          <X size={12} />
        </button>
      </div>

      {/* ── Dropdown ── */}
      {editSection && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200,
            minWidth: editSection === "field" ? 170 : editSection === "operator" ? 140 : 200,
            maxHeight: 260, overflowY: "auto",
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`, borderRadius: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            padding: "4px 0",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(87,177,255,0.12) transparent",
          }}
        >
          {editSection === "field" && FILTER_FIELDS.map(fd => (
            <DropdownItem
              key={fd.key}
              label={fd.label}
              selected={fd.key === filter.field}
              onClick={() => handleFieldChange(fd.key)}
            />
          ))}

          {editSection === "operator" && ALL_OPERATORS.map(op => (
            <DropdownItem
              key={op}
              label={op}
              selected={op === filter.operator}
              onClick={() => handleOperatorChange(op)}
            />
          ))}

          {editSection === "value" && (
            filter.operator === "in list" ? (
              <InListEditor currentValue={filter.value} values={fieldValues} onCommit={handleValueChange} />
            ) : (
              filter.operator === "contains" || filter.operator === "starts with" ? (
                <FreeTextEditor currentValue={filter.value} onCommit={handleValueChange} />
              ) : (
                fieldValues.map(v => (
                  <DropdownItem
                    key={v}
                    label={v}
                    selected={v === filter.value}
                    onClick={() => handleValueChange(v)}
                  />
                ))
              )
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   DROPDOWN ITEM
   ================================================================ */

function DropdownItem({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-3 py-2 text-left transition-colors"
      style={{
        fontSize: 12,
        color: selected ? colors.textPrimary : colors.textSecondary,
        background: selected ? "rgba(87,177,255,0.10)" : "none",
        border: "none", cursor: "pointer",
        fontWeight: selected ? 500 : 400,
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.06)"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      <span>{label}</span>
      {selected && <Check size={12} color={colors.active} />}
    </button>
  );
}

/* ================================================================
   IN-LIST EDITOR (multi-select checkboxes)
   ================================================================ */

function InListEditor({ currentValue, values, onCommit }: {
  currentValue: string; values: string[]; onCommit: (v: string) => void;
}) {
  const selected = useMemo(() => new Set(currentValue.split(",").map(s => s.trim()).filter(Boolean)), [currentValue]);
  const [local, setLocal] = useState(selected);

  const toggle = (v: string) => {
    setLocal(prev => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });
  };

  return (
    <div>
      {values.filter(v => v !== "All").map(v => (
        <button
          key={v}
          onClick={() => toggle(v)}
          className="flex items-center gap-2 w-full px-3 py-2 text-left transition-colors"
          style={{ fontSize: 12, color: colors.textSecondary, background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.06)")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <span
            className="flex items-center justify-center"
            style={{
              width: 14, height: 14, borderRadius: 3,
              border: `1px solid ${local.has(v) ? colors.active : colors.border}`,
              backgroundColor: local.has(v) ? colors.active : "transparent",
            }}
          >
            {local.has(v) && <Check size={10} color="#fff" />}
          </span>
          <span>{v}</span>
        </button>
      ))}
      <div style={{ borderTop: `1px solid ${colors.border}`, padding: "6px 8px" }}>
        <button
          onClick={() => onCommit(Array.from(local).join(", "))}
          className="w-full py-1.5 rounded text-center transition-colors"
          style={{
            fontSize: 11, fontWeight: 500, color: "#fff",
            backgroundColor: colors.primary, border: "none", cursor: "pointer",
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.primaryHover)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.primary)}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   FREE TEXT EDITOR (for contains / starts with)
   ================================================================ */

function FreeTextEditor({ currentValue, onCommit }: { currentValue: string; onCommit: (v: string) => void }) {
  const [text, setText] = useState(currentValue);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div style={{ padding: "8px" }}>
      <input
        ref={inputRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") onCommit(text); }}
        placeholder="Type a value..."
        style={{
          width: "100%", padding: "6px 8px", borderRadius: 4,
          backgroundColor: "rgba(87,177,255,0.04)",
          border: `1px solid ${colors.border}`,
          color: colors.textPrimary, fontSize: 12,
          outline: "none",
        }}
        onFocus={e => (e.currentTarget.style.borderColor = colors.borderHover)}
        onBlur={e => (e.currentTarget.style.borderColor = colors.border)}
      />
      <button
        onClick={() => onCommit(text)}
        className="w-full py-1.5 rounded text-center mt-2 transition-colors"
        style={{
          fontSize: 11, fontWeight: 500, color: "#fff",
          backgroundColor: colors.primary, border: "none", cursor: "pointer",
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = colors.primaryHover)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = colors.primary)}
      >
        Apply
      </button>
    </div>
  );
}

/* ================================================================
   DASHBOARD VIEW — driven by filtered data
   ================================================================ */

function DashboardView({ kpi, typeDist, riskIndicators }: {
  kpi: typeof KPI_DATA;
  typeDist: { type: string; count: number; color: string }[];
  riskIndicators: { label: string; count: number }[];
}) {
  return (
    <div className="p-6 flex flex-col gap-4" style={{ maxWidth: "100%", overflowX: "hidden" }}>
      {/* ── KPI Row 1: 3 cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "start" }}>
        <KpiCard label="Total Assets" value={kpi.totalAssets.toLocaleString()} />
        <KpiCard label="Newly Added Assets" value={String(kpi.newlyAdded)} valueColor={colors.active} />
        <KpiCard label="Ownership Coverage" value={`${kpi.ownershipCoverage}%`} valueColor={colors.active} delta={kpi.ownershipDelta} deltaColor={colors.active} />
      </div>

      {/* ── KPI Row 2: 2 cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <KpiCard label="Classification Coverage" value={`${kpi.classificationCoverage}%`} delta={kpi.classificationDelta} deltaColor={colors.active} />
        <KpiCard label="High-Risk Assets" value={String(kpi.highRiskAssets)} valueColor={colors.critical} delta={kpi.highRiskDelta} deltaColor={colors.critical} />
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        {/* Asset Inventory Trend */}
        <DashCard title="Asset Inventory Trend">
          <div style={{ height: 200 }}>
            <DeferredChart>
              <LineChart data={INVENTORY_TREND} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid key="grid" stroke="rgba(87,177,255,0.06)" strokeDasharray="3 3" vertical={false} />
                <XAxis key="xaxis" dataKey="day" tick={{ fill: colors.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis key="yaxis" tick={{ fill: colors.textDim, fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 50]} />
                <Tooltip key="tooltip" contentStyle={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 11 }} />
                <Line key="line-new" type="monotone" dataKey="newAssets" stroke={colors.active} strokeWidth={2} dot={false} name="New Assets" />
                <Line key="line-owner" type="monotone" dataKey="ownershipAssigned" stroke="#3b82f6" strokeWidth={2} dot={false} name="Ownership Assigned" />
              </LineChart>
            </DeferredChart>
          </div>
          <div className="flex items-center gap-5 mt-2 px-1">
            <LegendDot color={colors.active} label="New Assets" />
            <LegendDot color="#3b82f6" label="Ownership Assigned" />
          </div>
        </DashCard>

        {/* Asset Types Distribution — driven by filtered data */}
        <DashCard title="Asset Types Distribution">
          <div className="flex items-center" style={{ height: 220 }}>
            <div style={{ width: 190, height: 190, flexShrink: 0, marginLeft: -8 }}>
              {typeDist.length > 0 ? (
                <DeferredChart>
                  <PieChart>
                    <Pie key="pie" data={typeDist} dataKey="count" nameKey="type" cx="50%" cy="50%"
                      innerRadius={52} outerRadius={88} paddingAngle={2} stroke="none">
                      {typeDist.map((entry) => (
                        <Cell key={`pie-cell-${entry.type}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip key="pie-tooltip" contentStyle={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 11 }} />
                  </PieChart>
                </DeferredChart>
              ) : (
                <div className="flex items-center justify-center h-full" style={{ color: colors.textDim, fontSize: 12 }}>No data</div>
              )}
            </div>
            <div className="flex flex-col gap-2.5 ml-4">
              {typeDist.map(d => (
                <div key={d.type} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                  <span style={{ fontSize: 12, color: colors.textSecondary }}>{d.type} ({d.count})</span>
                </div>
              ))}
            </div>
          </div>
        </DashCard>
      </div>

      {/* ── Asset Risk Indicators — driven by filtered data ── */}
      <DashCard title="Asset Risk Indicators">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {riskIndicators.map(r => (
            <div key={r.label} style={{
              borderRadius: 8, padding: "16px 20px",
              border: `1px solid ${colors.border}`, backgroundColor: "rgba(87,177,255,0.015)",
            }}>
              <span style={{ fontSize: 12, color: colors.textMuted, display: "block", marginBottom: 10 }}>{r.label}</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary, letterSpacing: "-0.02em" }}>{r.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </DashCard>
    </div>
  );
}

/* ================================================================
   KPI CARD
   ================================================================ */

function KpiCard({ label, value, valueColor, delta, deltaColor }: {
  label: string; value: string; valueColor?: string; delta?: string; deltaColor?: string;
}) {
  return (
    <div style={{
      borderRadius: 8, padding: "20px 24px",
      border: `1px solid ${colors.border}`, backgroundColor: "rgba(87,177,255,0.015)",
      position: "relative", display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 13, color: colors.textMuted }}>{label}</span>
          <Info size={13} color={colors.textDim} strokeWidth={1.5} style={{ opacity: 0.6 }} />
        </div>
        <div className="flex items-center gap-2">
          <Share2 size={14} color={colors.textDim} strokeWidth={1.5} style={{ opacity: 0.4 }} />
          <MoreVertical size={14} color={colors.textDim} strokeWidth={1.5} style={{ opacity: 0.4 }} />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <span style={{ fontSize: 36, fontWeight: 700, color: valueColor || colors.textPrimary, lineHeight: 1, letterSpacing: "-0.02em" }}>
          {value}
        </span>
        {delta && (
          <span style={{ fontSize: 12, fontWeight: 500, color: deltaColor || colors.textDim, marginBottom: 4 }}>{delta}</span>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   DASHBOARD CARD wrapper
   ================================================================ */

function DashCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      borderRadius: 8, padding: "20px 24px",
      border: `1px solid ${colors.border}`, backgroundColor: "rgba(87,177,255,0.015)",
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{title}</span>
          <Info size={13} color={colors.textDim} strokeWidth={1.5} style={{ opacity: 0.5 }} />
        </div>
        <div className="flex items-center gap-2">
          <Share2 size={14} color={colors.textDim} strokeWidth={1.5} style={{ opacity: 0.4 }} />
          <MoreVertical size={14} color={colors.textDim} strokeWidth={1.5} style={{ opacity: 0.4 }} />
        </div>
      </div>
      {children}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
      <span style={{ fontSize: 11, color: colors.textMuted }}>{label}</span>
    </div>
  );
}

/* ================================================================
   REGISTER LIST VIEW — driven by filtered data
   ================================================================ */

type SortCol = "securityPlane" | "assetType" | "service" | "cia";
type SortDir = "asc" | "desc";

function buildAssetContext(asset: Asset) {
  return {
    type: "asset" as const,
    label: asset.name,
    sublabel: `${asset.service} · ${asset.assetType}`,
    contextKey: `asset:${asset.id}`,
    suggestions: [
      { label: "Explain this asset", prompt: `Explain the risk profile of ${asset.name}` },
      { label: "Assess risk", prompt: `Assess the current risk for ${asset.name}` },
      { label: "Reclassify asset", prompt: `Reclassify asset ${asset.name}` },
      { label: "Show vulnerabilities", prompt: `Show vulnerabilities for ${asset.name}` },
      { label: "Show attack paths", prompt: `Show attack paths involving ${asset.name}` },
    ],
    greeting: `I have **${asset.name}** loaded (${asset.service}, ${asset.severity} severity, risk score ${asset.riskScore}). What would you like to investigate?`,
  };
}

function RegisterListView({ filteredAssets }: { filteredAssets: Asset[] }) {
  const navigate = useNavigate();
  const { openWithContext } = useAiBox();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState<SortCol | "">("");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  /* Reset page when filteredAssets changes */
  useEffect(() => { setPage(0); }, [filteredAssets]);

  const toggleSort = useCallback((col: SortCol) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }, [sortCol]);

  const filtered = useMemo(() => {
    let list = [...filteredAssets];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(a => a.name.toLowerCase().includes(s) || a.accountId.toLowerCase().includes(s) || a.service.toLowerCase().includes(s));
    }
    if (sortCol) {
      list.sort((a, b) => {
        let cmp = 0;
        if (sortCol === "securityPlane") cmp = a.securityPlane.localeCompare(b.securityPlane);
        else if (sortCol === "assetType") cmp = a.assetType.localeCompare(b.assetType);
        else if (sortCol === "service") cmp = a.service.localeCompare(b.service);
        else if (sortCol === "cia") cmp = (a.ciaC + a.ciaI + a.ciaA) - (b.ciaC + b.ciaI + b.ciaA);
        return sortDir === "desc" ? -cmp : cmp;
      });
    }
    return list;
  }, [filteredAssets, search, sortCol, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="p-6 flex flex-col gap-3">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12, color: colors.textMuted }}>
            {filtered.length} asset{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Clock size={12} color={colors.textDim} />
            <span style={{ fontSize: 11, color: colors.textDim }}>Last Synced: 10 hrs ago</span>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              <ThPlain>Account Details</ThPlain>
              <ThPlain>Asset Name</ThPlain>
              <ThSort label="Security Plane" col="securityPlane" active={sortCol} dir={sortDir} onSort={toggleSort} />
              <ThSort label="Asset Type" col="assetType" active={sortCol} dir={sortDir} onSort={toggleSort} />
              <ThSort label="Service" col="service" active={sortCol} dir={sortDir} onSort={toggleSort} />
              <ThSort label="C.I.A" col="cia" active={sortCol} dir={sortDir} onSort={toggleSort} />
              <ThPlain>Asset Owner</ThPlain>
              <ThPlain>Asset Custodian</ThPlain>
              <ThPlain></ThPlain>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: "40px 16px", textAlign: "center", color: colors.textDim, fontSize: 13 }}>
                  No assets match the current filters.
                </td>
              </tr>
            )}
            {paged.map(asset => (
              <tr key={asset.id}
                onClick={() => navigate(`/asset/${asset.id}`)}
                className="transition-colors"
                style={{ cursor: "pointer", borderBottom: `1px solid rgba(87,177,255,0.06)` }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.04)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                <TdCell>
                  <span style={{ fontSize: 12, color: colors.textSecondary, fontFamily: "'SF Mono','Fira Code',monospace" }}>
                    {asset.accountId.length > 22 ? asset.accountId.slice(0, 22) + "..." : asset.accountId}
                  </span>
                </TdCell>
                <TdCell>
                  <span onClick={e => e.stopPropagation()}>
                    <EntityLink entityType="asset" entityId={asset.id} label={asset.name} style={{ fontSize: 12, borderBottom: "none" }} />
                  </span>
                </TdCell>
                <TdCell><span style={{ fontSize: 12, color: colors.textSecondary }}>{asset.securityPlane}</span></TdCell>
                <TdCell><span style={{ fontSize: 12, color: colors.textSecondary }}>{asset.assetType}</span></TdCell>
                <TdCell><span style={{ fontSize: 12, color: colors.textSecondary }}>{asset.service}</span></TdCell>
                <TdCell>
                  <div className="flex items-center gap-1">
                    <span style={{ fontSize: 12, color: colors.textSecondary }}>{asset.ciaC}/{asset.ciaI}/{asset.ciaA}</span>
                    <Pencil size={11} color={colors.textDim} style={{ opacity: 0.5 }} />
                  </div>
                </TdCell>
                <TdCell>
                  {asset.owner ? (
                    <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: "rgba(87,177,255,0.05)", border: `1px solid ${colors.border}` }}>
                      <span style={{ fontSize: 11, color: colors.textSecondary, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.owner}</span>
                      <ChevronDown size={10} color={colors.textDim} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: "rgba(87,177,255,0.03)", border: `1px solid ${colors.border}` }}>
                      <span style={{ fontSize: 11, color: colors.textDim }}>Select Owner</span>
                      <ChevronDown size={10} color={colors.textDim} />
                    </div>
                  )}
                </TdCell>
                <TdCell>
                  {asset.custodian ? (
                    <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: "rgba(87,177,255,0.05)", border: `1px solid ${colors.border}` }}>
                      <span style={{ fontSize: 11, color: colors.textSecondary, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{asset.custodian}</span>
                      <ChevronDown size={10} color={colors.textDim} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: "rgba(87,177,255,0.03)", border: `1px solid ${colors.border}` }}>
                      <span style={{ fontSize: 11, color: colors.textDim }}>Select Custodian</span>
                      <ChevronDown size={10} color={colors.textDim} />
                    </div>
                  )}
                </TdCell>
                {/* AI quick-actions — stop row nav, open AIBox with asset context */}
                <TdCell>
                  <div className="flex items-center gap-[5px]" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => openWithContext({ ...buildAssetContext(asset), initialQuery: `Explain the risk profile of ${asset.name}` })}
                      className="px-2 py-[3px] rounded-[4px] text-[9px] font-medium border transition-colors"
                      style={{ color: colors.accent, borderColor: "rgba(87,177,255,0.18)", backgroundColor: "rgba(87,177,255,0.04)" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.10)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.04)")}
                    >
                      Explain
                    </button>
                    <button
                      onClick={() => openWithContext({ ...buildAssetContext(asset), initialQuery: `Assess the current risk for ${asset.name}` })}
                      className="px-2 py-[3px] rounded-[4px] text-[9px] font-medium border transition-colors"
                      style={{ color: colors.accent, borderColor: "rgba(87,177,255,0.18)", backgroundColor: "rgba(87,177,255,0.04)" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.10)")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(87,177,255,0.04)")}
                    >
                      Assess
                    </button>
                  </div>
                </TdCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-2">
          <PagBtn disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /></PagBtn>
          <span style={{ fontSize: 12, color: colors.textSecondary, minWidth: 60, textAlign: "center" }}>{page + 1} of {totalPages}</span>
          <PagBtn disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight size={14} /></PagBtn>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   TABLE PRIMITIVES
   ================================================================ */

function ThPlain({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500,
      color: colors.textMuted, whiteSpace: "nowrap",
    }}>{children}</th>
  );
}

function ThSort({ label, col, active, dir, onSort }: {
  label: string; col: SortCol; active: SortCol | ""; dir: SortDir;
  onSort: (c: SortCol) => void;
}) {
  const isActive = active === col;
  return (
    <th onClick={() => onSort(col)} style={{
      padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 500,
      color: isActive ? colors.textPrimary : colors.textMuted, whiteSpace: "nowrap",
      cursor: "pointer", userSelect: "none",
    }}>
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={12} style={{ opacity: isActive ? 0.8 : 0.3 }} />
      </div>
    </th>
  );
}

function TdCell({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>{children}</td>;
}

function PagBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 30, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
      cursor: disabled ? "default" : "pointer", border: `1px solid ${colors.border}`,
      backgroundColor: "transparent", color: disabled ? colors.textDim : colors.textSecondary,
      opacity: disabled ? 0.4 : 1, transition: "all 100ms ease",
    }}>
      {children}
    </button>
  );
}

/* ================================================================
   PLACEHOLDER TAB
   ================================================================ */

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center" style={{ height: 400 }}>
      <div className="flex flex-col items-center gap-3">
        <Network size={40} color={colors.textDim} strokeWidth={1} />
        <span style={{ fontSize: 14, color: colors.textDim }}>{label}</span>
        <span className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "rgba(87,177,255,0.04)", border: `1px solid ${colors.border}` }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors.buttonPrimary }} />
          <span style={{ fontSize: 11, color: colors.textDim }}>Coming Soon</span>
        </span>
      </div>
    </div>
  );
}