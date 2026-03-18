import React, { Suspense } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "sonner";
import { debug } from "./shared/utils/debug";
import { PersonaProvider } from "./features/persona";

function LoadingFallback() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#0a0e14",
        color: "#8899aa",
      }}
    >
      Loading…
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    debug.error("App Error:", error, errorInfo);
    // Auto-reload on module fetch errors
    if (error.message?.includes("Failed to fetch dynamically imported module")) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#0a0e14",
            color: "#8899aa",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div>Loading error detected...</div>
          <div style={{ fontSize: "12px", opacity: 0.6 }}>Reloading page...</div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <PersonaProvider>
          <RouterProvider router={router} />
            <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#0a1520",
                border: "1px solid #0E1C26",
                color: "#eef3f8",
                fontSize: "13px",
              },
            }}
          />
        </PersonaProvider>
      </Suspense>
    </ErrorBoundary>
  );
}