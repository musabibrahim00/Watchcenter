# Global Layout Safety Rules

This document defines the layout stability architecture implemented across the entire Watch Center application.

## ✅ Implementation Status

### **Applied to:**
- ✅ Case Management Dashboard
- ✅ Asset Register Pages (Dashboard + List)
- ✅ Global Application Shell (Layout.tsx)

### **Architecture Components:**

1. **PageContainer** - Wraps all page content with safety constraints
2. **ChartContainer** - Fixed-height wrapper for all charts (320px default)
3. **DashboardGrid** - Grid layout with `alignItems: start` to prevent stretching
4. **ButtonGroup** - Flexible button layout with wrapping support (from `@/shared/components/ui`)

---

## 📐 Core Layout Rules

### 1. Global Container Rules

**Every main page must enforce:**

```typescript
{
  maxWidth: "100%",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column"
}
```

**Purpose:** Prevents horizontal scroll and component overflow.

---

### 2. Chart Safety Rules

**All charts must be wrapped in a fixed-height container:**

```typescript
{
  height: "320px",
  minHeight: "320px",
  maxHeight: "320px",
  overflow: "hidden"
}
```

**Implementation:**
- Use `ChartContainer` component from `/src/app/shared/components/layout`
- Charts scale to container width but NEVER expand vertically
- No `ResponsiveContainer` from recharts (use explicit dimensions with ResizeObserver)

**Example:**
```tsx
<ChartContainer height={320}>
  <LineChart width={width} height={320} data={data}>
    {/* ... chart elements ... */}
  </LineChart>
</ChartContainer>
```

---

### 3. Grid Layout Rules

**For dashboard grids, always apply:**

```typescript
{
  display: "grid",
  gridTemplateColumns: "repeat(N, 1fr)", // or auto-fit
  gap: 16, // consistent spacing
  alignItems: "start" // CRITICAL: prevents vertical stretching
}
```

**Implementation:**
```tsx
<DashboardGrid columns={4} gap={16}>
  <KPICard {...} />
  <KPICard {...} />
  {/* ... */}
</DashboardGrid>
```

**Why `alignItems: start`?**
- Without it, grid items stretch to match the tallest item
- Charts and cards can expand infinitely
- This is the #1 cause of layout breakage

---

### 4. Card Layout Rules

**All dashboard cards follow:**

```
Card Container
├── Header (fixed height)
├── Content (scrollable if needed)
└── Footer (optional, fixed height)
```

**Chart Cards:**
```typescript
{
  maxHeight: "420px" // prevents infinite growth
}
```

---

### 5. Button Group Rules

**When multiple buttons exist in a footer:**

```typescript
{
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  justifyContent: "start"
}
```

**Behavior:**
- Primary actions stay on first row
- Secondary actions wrap to next line
- Buttons NEVER overlap

**Implementation:**
```tsx
import { ButtonGroup } from "@/shared/components";

<ButtonGroup wrap spacing="sm">
  <button>Primary Action</button>
  <button>Secondary</button>
  <button>Tertiary</button>
</ButtonGroup>
```

---

### 6. Text Overflow Rules

**For long titles:**
```css
{
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
}
```

**For descriptions:**
```css
{
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden"
}
```

---

### 7. Sidebar Layer Rules

**Sidebar must remain above all content:**

```
z-index hierarchy:
├── Sidebar Navigation: z-[50] (highest)
├── Top Header: z-[40] (second)
└── Main Content: z-[0] (base)
```

**Current Implementation:**
- `/src/app/components/Layout.tsx` enforces this architecture
- Sidebar tooltips always visible
- Never hidden behind page content

---

### 8. Scroll Behavior Rules

**Only page content scrolls:**

```
Fixed (no scroll):
├── Sidebar Navigation
├── Top Header
└── Global Navigation

Scrollable:
└── Main Content Canvas (within Layout)
```

**Implementation:**
```tsx
<div className="flex-1 overflow-auto">
  {/* Only this area scrolls */}
  <Outlet />
</div>
```

---

## 🎯 Application Checklist

When creating or updating a page:

- [ ] Wrap main content in `PageContainer`
- [ ] Use `ChartContainer` for all charts
- [ ] Apply `DashboardGrid` with `alignItems: start` for card grids
- [ ] Use `ButtonGroup` for action buttons
- [ ] Add text overflow rules for long content
- [ ] Test chart height stability (should never expand)
- [ ] Test responsive behavior (width scales, height fixed)
- [ ] Verify sidebar tooltips visible on page
- [ ] Check scroll behavior (only content scrolls)

---

## 📦 Component Import

```typescript
import {
  PageContainer,
  ChartContainer,
  DashboardGrid,
  ButtonGroup,
} from "@/shared/components";
```

---

## 🔧 Migration Guide

### Before:
```tsx
<div className="p-6">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          {/* ... */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
```

### After:
```tsx
<PageContainer>
  <DashboardGrid columns={2} gap={16}>
    <ChartContainer height={320}>
      <LineChart width={width} height={320} data={data}>
        {/* ... */}
      </LineChart>
    </ChartContainer>
  </DashboardGrid>
</PageContainer>
```

---

## 🚨 Common Pitfalls

### ❌ DON'T:
```typescript
// Charts without fixed height
<ResponsiveContainer width="100%" height="100%">

// Grids without alignItems: start
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

// Buttons without wrapping
<div style={{ display: "flex" }}>
```

### ✅ DO:
```typescript
// Fixed-height chart container
<ChartContainer height={320}>
  <LineChart width={width} height={320} />
</ChartContainer>

// Grid with alignment
<DashboardGrid columns={2} gap={16}>

// Flexible button group
<ButtonGroup gap={8}>
```

---

## 📊 Chart Best Practices

### Use ResizeObserver for Width:
```typescript
const containerRef = useRef<HTMLDivElement>(null);
const [width, setWidth] = useState(0);

useEffect(() => {
  if (!containerRef.current) return;
  
  const observer = new ResizeObserver((entries) => {
    const { width } = entries[0].contentRect;
    setWidth(width);
  });
  
  observer.observe(containerRef.current);
  return () => observer.disconnect();
}, []);

// Render
<div ref={containerRef} style={{ height: 320 }}>
  {width > 0 && (
    <LineChart width={width} height={320} data={data} />
  )}
</div>
```

---

## Result

These rules ensure:

✅ **Charts never expand infinitely**  
✅ **Buttons never overlap**  
✅ **Cards maintain consistent height**  
✅ **Grid layouts stay stable**  
✅ **Sidebar always appears above content**  
✅ **No horizontal overflow**  
✅ **Responsive width, fixed height**  

**No visual redesign occurs. Only layout stability is enforced.**