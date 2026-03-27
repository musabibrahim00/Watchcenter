import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import Layout from "./components/Layout";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFoundPage from "./pages/NotFoundPage";
import { getStoredExperience } from "./pages/ExperienceChooser";

const WatchDst = React.lazy(() => import("../imports/WatchDst"));

/**
 * Rendered at `/` — routes to the right place based on stored experience:
 * - No experience chosen → /choose
 * - Ali               → /compliance
 * - Musab             → renders WatchDst (keeps URL as /)
 */
function RootGuard() {
  const exp = getStoredExperience();
  if (!exp) return <Navigate to="/choose" replace />;
  if (exp === "ali") return <Navigate to="/compliance" replace />;
  return (
    <React.Suspense fallback={null}>
      <WatchDst />
    </React.Suspense>
  );
}

// Fallback component for loading errors
function LoadingError() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0a0e14',
      color: '#8899aa',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div>Failed to load module. Refreshing...</div>
    </div>
  );
}

export const router = createBrowserRouter(
  [
    {
      path: "/choose",
      lazy: () => import("./pages/ExperienceChooser").then(m => ({ Component: m.default })),
    },
    {
      path: "/",
      Component: Layout,
      HydrateFallback: () => <div style={{ background: '#0a0e1a', width: '100vw', height: '100vh' }} />,
      ErrorBoundary: LoadingError,
      children: [
        { index: true, Component: RootGuard },
        { path: "sub/:moduleId", lazy: () => import("./pages/SubPage").then(m => ({ Component: m.default })) },
        { path: "agent/:agentSlug", lazy: () => import("./pages/AgentDetailPage").then(m => ({ Component: m.default })) },
        { path: "attack-paths", lazy: () => import("./pages/AttackPathPage").then(m => ({ Component: m.default })) },
        { path: "attack-paths/:pathId", lazy: () => import("./pages/AttackPathDetailPage").then(m => ({ Component: m.default })) },
        { path: "asset/:assetId", lazy: () => import("./pages/AssetDetailPage").then(m => ({ Component: m.default })) },
        { path: "asset-register", lazy: () => import("./pages/asset-register/AssetRegisterPage").then(m => ({ Component: m.default })) },
        { path: "asset-register/:view", lazy: () => import("./pages/asset-register/AssetRegisterPage").then(m => ({ Component: m.default })) },
        { path: "case-management", lazy: () => import("./pages/case-management/CaseManagementPage").then(m => ({ Component: m.default })) },
        { path: "case-management/:caseId", lazy: () => import("./pages/case-management/CaseDetailPage").then(m => ({ Component: m.default })) },
        { path: "workflows", lazy: () => import("./pages/workflows/WorkflowsIndexPage").then(m => ({ Component: m.default })) },
        { path: "workflows/new", lazy: () => import("./pages/workflows/WorkflowsIndexPage").then(m => ({ Component: m.default })) },
        { path: "workflows/new/:workflowId", lazy: () => import("./pages/workflows/WorkflowsIndexPage").then(m => ({ Component: m.default })) },
        { path: "integrations", lazy: () => import("./pages/IntegrationsPage").then(m => ({ Component: m.default })) },
        {
          path: "risk-register",
          element: <PlaceholderPage title="Risk Register" />,
        },
        {
          path: "vulnerabilities",
          element: <PlaceholderPage title="Vulnerabilities" />,
        },
        { path: "compliance", lazy: () => import("./pages/CompliancePage").then(m => ({ Component: m.default })) },
        { path: "compliance/:frameworkId", lazy: () => import("./pages/ComplianceFrameworkPage").then(m => ({ Component: m.default })) },
        { path: "compliance/:frameworkId/policies/:policyId", lazy: () => import("./pages/compliance/PolicyDetailPage").then(m => ({ Component: m.default })) },
        { path: "compliance/:frameworkId/documents/:documentId", lazy: () => import("./pages/compliance/DocumentDetailPage").then(m => ({ Component: m.default })) },
        {
          path: "misconfigurations",
          element: <PlaceholderPage title="Misconfigurations" />,
        },
        {
          path: "employees",
          element: <PlaceholderPage title="Employees" />,
        },
        {
          path: "settings",
          element: <PlaceholderPage title="Settings" />,
        },
        {
          path: "control-center",
          element: <PlaceholderPage title="Control Center" />,
        },
        { path: "*", Component: NotFoundPage },
      ],
    },
  ],
  {
    future: {
      v7_partialHydration: true,
    },
  }
);
