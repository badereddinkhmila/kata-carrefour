import { Outlet, createRootRoute } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { type FC } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

const RootComponent: FC = () => (
  <QueryClientProvider client={queryClient}>
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
    <Toaster position="bottom-center" richColors closeButton />
  </QueryClientProvider>
);

export const Route = createRootRoute({
  component: RootComponent,
});
