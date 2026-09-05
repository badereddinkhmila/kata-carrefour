import { applyThemeFromStorage } from "@/lib/theme-init";

applyThemeFromStorage();

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { AuthHydrationGate } from "@/components/auth-hydration-gate";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  initializeFrontendObservability,
  recordRouteChange,
} from "@/lib/frontend-observability";
import "./index.css";

initializeFrontendObservability();

const router = createRouter({ routeTree });
router.subscribe("onResolved", ({ toLocation }) => {
  recordRouteChange(toLocation.pathname);
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthHydrationGate>
        <RouterProvider router={router} />
      </AuthHydrationGate>
    </ErrorBoundary>
  </StrictMode>
);
