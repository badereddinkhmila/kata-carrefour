import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Iconify asynchronously loads icon data, which can leave timers alive after jsdom tears down.
vi.mock("@iconify/react", () => ({ Icon: () => null }));
