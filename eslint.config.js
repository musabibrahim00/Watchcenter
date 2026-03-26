import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  // Ignore build output, CLI scripts, and external reference directory
  { ignores: ["dist/", "cli/", "agency-agents/"] },

  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // ── React Hooks — correctness rules ─────────────────────────────
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // React Compiler rules (react-hooks v7 additions) — disabled.
      // This codebase targets React 18; the compiler rules fire on many
      // established patterns (manual memoization, setState-on-mount effects,
      // UUID generation in render) and would require broad rewrites with no
      // practical runtime benefit until the React 19 compiler is adopted.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/no-ref-in-render-function": "off",
      "react-hooks/no-impure-function-in-render": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/component-should-be-component-in-render": "off",
      "react-hooks/must-use-result": "off",

      // ── React Refresh — needed for Vite HMR correctness ─────────────
      // Scoped off for shadcn/ui files that intentionally co-export a
      // component alongside a `variants` helper (e.g. buttonVariants).
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // ── TypeScript — turn off rules that conflict with this codebase ──
      // Codebase predates strict mode; `any` is used intentionally in many places
      "@typescript-eslint/no-explicit-any": "off",
      // Unused-var enforcement is delegated to tsconfig (noUnusedLocals = false by design)
      "@typescript-eslint/no-unused-vars": "off",
      // Empty interfaces are used as extension points
      "@typescript-eslint/no-empty-object-type": "off",
      // Import paths use .tsx extensions (Vite bundler mode)
      "@typescript-eslint/no-require-imports": "off",
      // Allow ternary expressions used for side effects (common React event handler pattern)
      "@typescript-eslint/no-unused-expressions": ["error", { allowTernary: true }],

      // ── Base JS ──────────────────────────────────────────────────────
      // Avoids flagging intentional console.debug in audit-log and debug utilities
      "no-console": "off",
    },
  },

  // shadcn/ui component files intentionally co-export a component and a
  // CVA `variants` helper from the same file. Disable the refresh warning
  // for those directories only.
  {
    files: [
      "src/app/components/ui/**",
      "src/app/shared/components/ui/**",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
);
