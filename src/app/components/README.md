# Component Directory

This directory contains the core layout components for the Watch Center platform.

## Layout Architecture

### Primary Layout Components

#### `Layout.tsx` - Root Application Shell
The main layout wrapper that provides the global application structure for all pages.

**Structure:**
```
┌─────────────────────────────────┐
│ Sidebar  │  Header (z-40)       │
│ (z-50)   ├──────────────────────┤
│          │  Content Canvas      │
│ 64px     │  (z-0, scrollable)   │
└─────────────────────────────────┘
```

**Features:**
- Persistent sidebar navigation
- Sticky header with dynamic page title
- Scrollable content canvas
- Proper z-index layering
- React Router integration

**Used by:** All pages via React Router

---

## Documentation Files

### `LAYOUT_ARCHITECTURE.md`
Comprehensive guide to the global layout system including:
- Architecture overview
- Component specifications
- Z-index layering rules
- Overflow and scroll behavior
- Best practices for page developers
- Adding new pages guide

### `LayoutDiagram.tsx`
Visual React component showing:
- Layout structure diagram
- Z-index hierarchy
- Key features grid
- Available modules list

Render this component to see a visual representation of the layout architecture.

---

## Quick Reference

### Z-Index Hierarchy
```
z-[100] → Modals / overlays (always above sidebar)
z-[50]  → Sidebar Navigation (tooltips always visible)
z-[40]  → Top Header (sticky)
z-[0]   → Main Content (base layer)
```

### Component Dimensions
```
Sidebar:  64px width, 100vh height
Header:   72px height, calc(100vw - 64px) width
Content:  Flexible, scrollable
```

### Key Files
```
/src/app/components/Layout.tsx              # Root layout shell
/src/imports/SidebarNavigation.tsx         # Global sidebar
/src/imports/Header.tsx                    # Global header
/src/app/routes.tsx                        # Route configuration
```

---

## Adding New Pages

1. Create page component in `/src/app/pages/`
2. Add route to `/src/app/routes.tsx` as child of Layout
3. Add navigation item to `/src/imports/SidebarNavigation.tsx`
4. Add page title mapping to `/src/imports/Header.tsx`

The page will automatically inherit the global layout!

---

## Design Rules

**For Page Developers:**
- ✅ Design content for scrollable canvas
- ✅ Use z-index < 50 for regular page elements
- ✅ Use z-[100] for modals and overlays (so they clear the sidebar)
- ❌ Don't recreate sidebar or header
- ❌ Don't use z-index between 50–99 for non-modal content

**For Layout Modifications:**
- ✅ Maintain z-index hierarchy
- ✅ Preserve sticky positioning
- ✅ Test tooltip visibility
- ❌ Don't change structure without team review

---

For detailed information, see `LAYOUT_ARCHITECTURE.md`.
