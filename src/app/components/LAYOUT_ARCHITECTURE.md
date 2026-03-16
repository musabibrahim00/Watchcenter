# Global Application Layout Architecture

## Overview

This document describes the root application shell layout that provides a consistent structure for all pages and modules across the entire Watch Center platform.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌────────┬──────────────────────────────────────────────────┐  │
│  │        │  Header (z-40)                                   │  │
│  │        │  • Dynamic page title                            │  │
│  │        │  • UTC clock                                     │  │
│  │        │  • Global actions (AI, Activity, Teammate)       │  │
│  │        ├──────────────────────────────────────────────────┤  │
│  │        │                                                  │  │
│  │ Side-  │  Main Content Canvas (z-0)                      │  │
│  │ bar    │  ┌────────────────────────────────────────────┐  │  │
│  │ (z-50) │  │                                            │  │  │
│  │        │  │  • Watch Center                            │  │  │
│  │ 64px   │  │  • Control Center                          │  │  │
│  │ fixed  │  │  • Asset Register                          │  │  │
│  │        │  │  • Attack Path                             │  │  │
│  │        │  │  • Risk Register                           │  │  │
│  │        │  │  • Vulnerabilities                         │  │  │
│  │        │  │  • Misconfigurations                       │  │  │
│  │        │  │  • Case Management                         │  │  │
│  │        │  │  • Compliance                              │  │  │
│  │        │  │  • etc...                                  │  │  │
│  │        │  │                                            │  │  │
│  │        │  └────────────────────────────────────────────┘  │  │
│  │        │                                                  │  │
│  └────────┴──────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Component Structure

### 1. Root Layout Component
**Location:** `/src/app/components/Layout.tsx`

The root layout component wraps all pages and provides:
- Application shell structure
- AiBoxProvider context for AI features
- Outlet for React Router child routes

### 2. Sidebar Navigation
**Location:** `/src/imports/SidebarNavigation.tsx`

**Specifications:**
- Width: `64px` (fixed)
- Position: `sticky top-0`
- Z-index: `50` (highest layer)
- Persistence: Always visible across all routes

**Navigation Items:**
- ✓ Watch Center
- ✓ Control Center
- ✓ Asset Register
- ✓ Employees
- ✓ Risk Register
- ✓ Attack Paths
- ✓ Vulnerabilities
- ✓ Misconfigurations
- ✓ Case Management
- ✓ Compliance
- ✓ Integrations
- ✓ Workflows
- ✓ Module Configurations
- ✓ Settings
- ✓ Profile

**Icon States:**
1. **Default** - Gray stroke `#62707D`
2. **Hover** - Brightened `#DADFE3` with dark background `#08121c`
3. **Active** - Bright `#E1F2FD` with gradient background and border
4. **Active + Hover** - Active state remains, tooltip appears

**Tooltip Behavior:**
- Position: `left-[40px]` (12px gap from sidebar edge)
- Z-index: `50` (always above page content)
- Opacity transition: `0` → `100%` on hover
- Never hidden by charts, dashboards, or page elements

### 3. Top Header
**Location:** `/src/imports/Header.tsx`

**Specifications:**
- Height: `72px` (fixed)
- Position: `sticky top-0`
- Z-index: `40` (second layer)
- Background: `#030609`

**Features:**
- Dynamic page title based on current route
- UTC clock display
- Global action icons (AI trace, Activity monitor, Teammate)
- Bottom border separator

**Page Title Mapping:**
```typescript
const PAGE_TITLES: Record<string, string> = {
  "/": "Watch Center",
  "/control-center": "Control Center",
  "/assets": "Asset Register",
  "/employees": "Employees",
  "/risk-register": "Risk Register",
  "/attack-path": "Attack Paths",
  "/vulnerabilities": "Vulnerabilities",
  "/misconfigurations": "Misconfigurations",
  "/case-management": "Case Management",
  "/compliance": "Compliance",
  "/integrations": "Integrations",
  "/workflows": "Workflows",
  "/settings": "Settings",
};
```

### 4. Main Content Canvas
**Specifications:**
- Position: `relative`
- Z-index: `0` (base layer)
- Overflow: `auto` (vertical scrolling)
- Flex: `1` (takes remaining space)

**Content Rules:**
- All page content renders via React Router `<Outlet />`
- Never overlaps sidebar or header
- Scrollable content area
- Full-width available after sidebar (64px offset)

## Z-Index Layering System

The application uses a strict z-index hierarchy to ensure proper element stacking:

```
Layer          Z-Index    Component                Purpose
────────────────────────────────────────────────────────────────
Highest        50         Sidebar Navigation       Tooltips always visible
Second         40         Top Header               Sticky page header
Base           0          Main Content Canvas      Page content
```

### Layering Rules

1. **Sidebar tooltips must always be visible**
   - Sidebar has `z-[50]`
   - Tooltips inherit sidebar's stacking context
   - Content at `z-[0]` never obscures tooltips

2. **Header stays below sidebar**
   - Header has `z-[40]`
   - Sticky positioning keeps it at top of content
   - Never overlaps sidebar tooltips

3. **Content never overlaps navigation**
   - All page content at `z-[0]` or lower
   - Charts, graphs, modals use z-index < 50
   - Exception: Modal overlays can use z-50+ when needed

## Overflow and Scroll Behavior

### Sidebar
- `overflow-hidden` on sidebar container
- No scrolling within sidebar
- Fixed height matches viewport

### Header
- `sticky top-0` positioning
- Stays visible when content scrolls
- Contained within right side of layout

### Main Content
- `overflow-auto` on main content area
- Vertical scrolling enabled
- Horizontal scrolling when needed (e.g., wide tables)

## Responsive Behavior

The layout is optimized for desktop/large screens:

- Sidebar: Always visible at `64px` width
- Header: Full width minus sidebar
- Content: Full width minus sidebar, with internal responsive design

**Note:** Individual pages handle their own responsive breakpoints and layouts within the content canvas.

## Adding New Pages

To add a new page to the platform:

1. **Create the page component** in `/src/app/pages/`
   ```tsx
   export default function NewPage() {
     return (
       <div className="p-6">
         {/* Page content */}
       </div>
     );
   }
   ```

2. **Add route** in `/src/app/routes.tsx`
   ```tsx
   { path: "new-page", Component: NewPage }
   ```

3. **Add navigation item** in `/src/imports/SidebarNavigation.tsx`
   ```tsx
   <NavItem to="/new-page" label="New Page">
     <IconNewPage />
   </NavItem>
   ```

4. **Add page title** in `/src/imports/Header.tsx`
   ```tsx
   const PAGE_TITLES: Record<string, string> = {
     // ...
     "/new-page": "New Page",
   };
   ```

The page will automatically:
- Render within the main content canvas
- Show proper navigation active state
- Display correct page title in header
- Persist sidebar and header across navigation

## Best Practices

### For Page Developers

1. **Do not recreate sidebar or header**
   - These components are provided by the layout
   - Pages only need to render content

2. **Respect z-index hierarchy**
   - Use z-index < 50 for page elements
   - Modals/overlays can use z-50+ when necessary
   - Never use z-index > 50 for regular content

3. **Design for the content canvas**
   - Assume sidebar takes 64px on left
   - Assume header takes 72px on top
   - Content area is scrollable

4. **Use consistent spacing**
   - Apply padding inside page components
   - Use design system tokens for consistency

### For Layout Modifications

1. **Maintain z-index hierarchy**
   - Sidebar: `z-[50]` (highest)
   - Header: `z-[40]`
   - Content: `z-[0]` (base)

2. **Preserve sticky positioning**
   - Sidebar: `sticky top-0`
   - Header: `sticky top-0`
   - Don't change positioning without team review

3. **Test navigation flows**
   - Verify tooltips appear above content
   - Check active states work correctly
   - Ensure smooth transitions between pages

## Current Modules

All these modules use the shared layout:

| Module               | Route Path          | Status       |
|---------------------|---------------------|--------------|
| Watch Center        | `/`                 | ✓ Implemented |
| Control Center      | `/control-center`   | Placeholder  |
| Asset Register      | `/assets`           | ✓ Implemented |
| Asset Detail        | `/assets/:id`       | ✓ Implemented |
| Employees           | `/employees`        | Placeholder  |
| Risk Register       | `/risk-register`    | Placeholder  |
| Attack Paths        | `/attack-path`      | ✓ Implemented |
| Attack Path Detail  | `/attack-path/:id`  | ✓ Implemented |
| Vulnerabilities     | `/vulnerabilities`  | Placeholder  |
| Misconfigurations   | `/misconfigurations`| Placeholder  |
| Case Management     | `/case-management`  | Placeholder  |
| Compliance          | `/compliance`       | Placeholder  |
| Integrations        | `/integrations`     | Placeholder  |
| Workflows           | `/workflows`        | Placeholder  |
| Settings            | `/settings`         | Placeholder  |
| Agent Detail        | `/agent/:id`        | ✓ Implemented |

## Files Reference

```
/src/app/components/
  ├── Layout.tsx                    # Root layout shell
  └── LAYOUT_ARCHITECTURE.md       # This file

/src/imports/
  ├── SidebarNavigation.tsx        # Global sidebar
  └── Header.tsx                   # Global header

/src/app/routes.tsx                # React Router configuration
/src/app/pages/                    # All page components
```

## Troubleshooting

**Issue:** Sidebar tooltip hidden behind content
- Check z-index on content elements
- Ensure nothing uses z-index > 50

**Issue:** Active state not highlighting
- Verify route path matches in `routes.tsx`
- Check `pathname.startsWith(to)` logic in NavItem

**Issue:** Header not showing correct title
- Add route to PAGE_TITLES mapping
- Check pathname matching logic

**Issue:** Content overlapping sidebar
- Verify Layout.tsx structure unchanged
- Check for absolute positioning on page content
