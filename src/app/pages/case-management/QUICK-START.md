# Cases Integration - Quick Start Guide

## 🚀 Integration is Complete and Active!

The Cases integration is **fully implemented** and **working correctly**. All cases created from Watch Center AI and Attack Path investigations automatically appear in the Cases list.

---

## ✅ How to Verify Integration is Working

### Option 1: Browser Console Tests (Recommended)

Open your browser's developer console and run:

```javascript
// Run all tests and see detailed output
window.casesTest.runAll();
```

This will:
- ✅ Create test cases from Watch Center AI
- ✅ Create test cases from Attack Path investigations
- ✅ Verify all required fields are populated correctly
- ✅ Confirm reactive updates are working
- ✅ Show cases appearing in the list

### Option 2: Individual Tests

```javascript
// Test Watch Center AI integration
window.casesTest.testWatchCenterAI();

// Test Attack Path integration
window.casesTest.testAttackPath();

// Test field population
window.casesTest.testFields();

// Test reactive subscription
window.casesTest.testReactive();
```

### Option 3: Manual Workflow Testing

#### Create Case from Watch Center AI
1. Navigate to the main dashboard (`/`)
2. Wait for a proactive AI scenario to appear in the Watch Center panel
3. Click the **"Create case"** action button
4. ✨ You'll be automatically navigated to the new case detail page
5. Navigate to **Case Management → Cases tab** (`/case-management`)
6. ✨ Your new case appears at the top of the table
7. ✨ Summary bar updates automatically
8. ✨ All filters work with the new case

#### Create Case from Attack Path
1. Navigate to any Attack Path detail page (e.g., `/attack-paths/ap-183`)
2. Click the **"Create Case"** button in the page header OR
3. Scroll to the Blast Radius panel → Click **"Create Case"** for a specific asset
4. ✨ Case created with full context (ARN, IPs, CVEs, blast radius)
5. ✨ Navigation to case detail page
6. Navigate to **Case Management → Cases tab**
7. ✨ New case visible at the top
8. ✨ All context-specific playbooks generated

---

## 📊 Real-Time Monitoring

### Add Integration Status Component (Optional)

To visually monitor the integration health, you can add the status component to any page:

```tsx
import { IntegrationStatus } from "./pages/case-management";

// Full status panel
<IntegrationStatus />

// Compact badge version
<IntegrationStatus compact />
```

This shows:
- Total cases count
- AI-generated cases count
- Attack Path cases count
- Cases created in last 24 hours
- Live subscription status
- Integration version

---

## 🔍 What to Look For

### When Creating a Case

**Immediate Effects:**
- ✅ Case Detail page opens automatically
- ✅ Investigation tab is active by default
- ✅ Initial AI observation appears
- ✅ Context-specific playbooks are generated
- ✅ All fields populated correctly

**In Cases List Page:**
- ✅ New case appears at the **top** of the table (newest first)
- ✅ All 8 columns populated:
  - Case ID (blue, clickable)
  - Severity badge (colored)
  - Case Name (truncated if long)
  - Resolution State ("Case Assigned")
  - Owner (avatar + name)
  - Created On (formatted timestamp)
  - Last Updated (formatted timestamp)
  - Verdict ("Under Review")
- ✅ Summary bar updates immediately
- ✅ Progress bar reflects new severity distribution
- ✅ Filters include the new case
- ✅ Search finds the new case

**No Page Refresh Required!**
The page uses `useSyncExternalStore` for reactive updates.

---

## 🧪 Test Scenarios

### Scenario 1: Watch Center AI Critical Alert
```javascript
window.casesTest.testWatchCenterAI();
// Creates: Critical severity case with AI context
// Expect: Red badge, "Watch Center AI" source, AI insight observation
```

### Scenario 2: Attack Path Investigation
```javascript
window.casesTest.testAttackPath();
// Creates: High severity case with attack path context
// Expect: Orange badge, "Attack Path Analysis" source, CVE info, blast radius
```

### Scenario 3: Multiple Cases Quickly
```javascript
window.casesTest.testWatchCenterAI();
window.casesTest.testAttackPath();
window.casesTest.testWatchCenterAI();
// Creates: 3 cases in rapid succession
// Expect: All 3 appear in list, summary bar updates, pagination adjusts
```

### Scenario 4: Filter After Creation
```javascript
window.casesTest.testWatchCenterAI(); // Creates Critical case
// Then in UI: Set Severity filter to "Critical"
// Expect: New case visible, filtered correctly
```

### Scenario 5: Update Existing Case
```javascript
// 1. Create a case using test utilities
window.casesTest.testWatchCenterAI();
// 2. Open the case detail page
// 3. Change status to "Escalated"
// 4. Navigate back to Cases list
// Expect: Status updated, Last Updated timestamp changed
```

---

## 📋 Integration Checklist

Use this to verify everything is working:

### Case Creation
- [ ] Watch Center AI "Create case" button works
- [ ] Attack Path header "Create Case" button works
- [ ] Blast Radius panel "Create Case" buttons work
- [ ] Case ID generated in CASE-XXXX format
- [ ] All required fields populated
- [ ] Navigation to case detail page works

### Cases List Display
- [ ] New cases appear at top of list
- [ ] No page refresh needed
- [ ] All 8 columns display correctly
- [ ] Badges and styling match design
- [ ] Summary bar updates immediately
- [ ] Progress bar reflects new distribution

### Filtering & Search
- [ ] Severity filter includes new cases
- [ ] Status filter works (default "Open")
- [ ] Verdict filter works (default "Under Review")
- [ ] Search finds new case by ID
- [ ] Search finds new case by title
- [ ] Search finds new case by owner name

### Sorting
- [ ] Default sort is newest first (working)
- [ ] Can sort by Case ID
- [ ] Can sort by Severity
- [ ] Can sort by Created On
- [ ] Can sort by Last Updated
- [ ] Can sort by Verdict

### Pagination
- [ ] 10 cases per page
- [ ] Total pages updates automatically
- [ ] New cases appear on page 1
- [ ] Navigation works (Previous/Next)

### Bidirectional Sync
- [ ] Status change in Case Detail → List updates
- [ ] Verdict change in Case Detail → List updates
- [ ] Owner change in Case Detail → List updates
- [ ] Last Updated timestamp updates
- [ ] No duplicate entries

---

## 🐛 Troubleshooting

### "New case not appearing in list"

**Check:**
1. Are you on the Cases tab? (`/case-management` with Cases tab selected)
2. Try removing all filters (set to "All")
3. Check if pagination is on page 1
4. Open browser console and run: `window.casesTest.testWatchCenterAI()`

**Expected behavior:**
Cases should appear **instantly** without refresh due to `useSyncExternalStore`.

### "Filters not working"

**Check:**
1. Look at the filter dropdowns - are they set correctly?
2. Try "All Severities" / "All Statuses" / "All Verdicts"
3. Clear search bar

**Expected behavior:**
Filters apply immediately and reset pagination to page 1.

### "Summary bar not updating"

**Check:**
1. Summary bar calculates from **filtered** cases, not all cases
2. If filters are active, counts show filtered results only
3. Progress bar shows percentage distribution

**Expected behavior:**
Summary updates on every render (automatically via useMemo).

### "Console errors"

**Common issues:**
- ✅ `recharts` warnings are suppressed in App.tsx (known library issue)
- ✅ React Router warnings: Make sure using `react-router` not `react-router-dom`

---

## 📚 Documentation References

- **Integration Verification:** `/src/app/pages/case-management/INTEGRATION-VERIFICATION.md`
- **Watch Center AI Integration:** `/src/app/pages/case-management/WATCH-CENTER-AI-INTEGRATION.md`
- **General Integration Guide:** `/src/app/pages/case-management/INTEGRATION.md`
- **Original Spec:** `/src/imports/cases-integration.md`

---

## 🎯 Key Files

### Core Integration
- `case-integration.ts` - Case creation utilities
- `case-data.ts` - Data store + reactive subscription system
- `CasesListPage.tsx` - List view with useSyncExternalStore

### Integration Points
- `/src/imports/AiBox.tsx` - Watch Center AI → Cases
- `/src/app/pages/AttackPathDetailPage.tsx` - Attack Path → Cases

### Testing
- `test-case-creation.ts` - Test utilities
- `IntegrationStatus.tsx` - Visual monitoring component

---

## ✨ Success Indicators

You know the integration is working when:

1. ✅ **Instant appearance:** Cases show up immediately without refresh
2. ✅ **Correct positioning:** New cases always at top of list
3. ✅ **Auto-updates:** Summary bar reflects new counts instantly
4. ✅ **Bidirectional sync:** Changes in Case Detail reflect in list
5. ✅ **Filter compatibility:** All filters and search work with new cases
6. ✅ **Proper styling:** Badges, colors, and spacing match design
7. ✅ **Navigation:** Clicking rows opens correct Case Detail page
8. ✅ **Context preservation:** All case context (AI insights, attack path data) preserved

---

## 🎉 That's It!

The integration is **complete** and **fully functional**. New cases from Watch Center AI and Attack Path investigations automatically appear in the Cases list with no additional work required.

**Need help?** Check the integration verification doc or run the test suite!

```javascript
// Quick verification
window.casesTest.runAll();
```

**Happy case hunting! 🔍🛡️**
