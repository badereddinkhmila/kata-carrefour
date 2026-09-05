import {
  type Faro,
  getWebInstrumentations,
  initializeFaro,
} from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

let frontendFaro: Faro | undefined;

function collectorUrl(): string | undefined {
  if (import.meta.env.VITE_FARO_COLLECTOR_URL) {
    return import.meta.env.VITE_FARO_COLLECTOR_URL;
  }

  return import.meta.env.PROD ? "/collect" : undefined;
}

export function normalizeFrontendPath(path: string): string {
  return path
    .replace(/\b[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\b/gi, ":id")
    .replace(/\/[0-9]+(?=\/|$)/g, "/:id");
}

export function initializeFrontendObservability(): void {
  const url = collectorUrl();
  if (!url || frontendFaro) {
    return;
  }

  frontendFaro = initializeFaro({
    url,
    app: {
      name: "client-application",
      namespace: "devoteam",
      version: import.meta.env.VITE_APP_VERSION ?? "local",
      environment: import.meta.env.MODE,
    },
    instrumentations: [
      // Browser errors, Web Vitals, navigation, views, and user actions are enabled.
      // Console capture stays off to avoid exporting arbitrary user-provided content.
      ...getWebInstrumentations({ captureConsole: false }),
      new TracingInstrumentation({
        instrumentationOptions: {
          propagateTraceHeaderCorsUrls: [/^https?:\/\/localhost:8080(?:\/|$)/],
        },
      }),
    ],
  });
}

export function recordRouteChange(pathname: string): void {
  frontendFaro?.api.pushEvent("route_change", {
    path: normalizeFrontendPath(pathname),
  });
}

export function recordApiFailure(method: string | undefined, path: string | undefined, status: number | undefined): void {
  frontendFaro?.api.pushEvent("api_request_failed", {
    method: method?.toUpperCase() ?? "UNKNOWN",
    path: normalizeFrontendPath(path ?? "unknown"),
    status: String(status ?? 0),
  });
}

export function recordFrontendError(error: Error, source: string): void {
  frontendFaro?.api.pushError(error, {
    context: { source },
  });
}
