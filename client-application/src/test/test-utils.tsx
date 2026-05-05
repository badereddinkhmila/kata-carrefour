import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRef, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const slotRef = createRef<ReactNode>();

function createTestRouter() {
  const testRootRoute = createRootRoute({
    component: () => (slotRef.current ?? <Outlet />) as React.ReactElement,
  });

  const testIndexRoute = createRoute({
    getParentRoute: () => testRootRoute,
    path: "/",
    component: () => null,
  });

  return createRouter({
    routeTree: testRootRoute.addChildren([testIndexRoute]),
    defaultPreload: "intent",
  });
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  const queryClient = createTestQueryClient();
  const router = createTestRouter();
  (slotRef as React.MutableRefObject<ReactNode | null>).current = ui;
  function Wrapper({ children }: { children: React.ReactNode }) {
    (slotRef as React.MutableRefObject<ReactNode | null>).current = children;
    return (
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
  }
  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}
