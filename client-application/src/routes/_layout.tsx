import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { type FC } from "react";

const LayoutComponent: FC = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <Outlet />
  </div>
);

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
});
