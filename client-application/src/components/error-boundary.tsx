import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error boundary caught:", error, errorInfo);
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Icon icon="mdi:alert-circle-outline" className="size-8" aria-hidden />
        </div>
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            An unexpected error occurred. You can try again or go back to the home page.
          </p>
        </div>
        <Button
          onClick={() => this.setState({ hasError: false })}
          variant="outline"
          className="gap-2"
        >
          <Icon icon="mdi:refresh" className="size-4" />
          Try again
        </Button>
        <Button asChild variant="ghost" className="gap-2">
          <a href="/">
            <Icon icon="mdi:home-outline" className="size-4" />
            Home
          </a>
        </Button>
      </main>
    );
  }
}
