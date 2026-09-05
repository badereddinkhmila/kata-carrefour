import { describe, expect, it } from "vitest";
import { normalizeFrontendPath } from "./frontend-observability";

describe("normalizeFrontendPath", () => {
  it("removes high-cardinality UUID and numeric path segments", () => {
    expect(
      normalizeFrontendPath(
        "/events/550e8400-e29b-41d4-a716-446655440000/orders/12345",
      ),
    ).toBe("/events/:id/orders/:id");
  });

  it("preserves stable route names", () => {
    expect(normalizeFrontendPath("/checkout/confirmation")).toBe(
      "/checkout/confirmation",
    );
  });
});
