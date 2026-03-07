import { type FC } from "react";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  variant?: "default" | "featured";
}

const SkeletonCard: FC<SkeletonCardProps> = ({ variant = "default" }) => {
  const isFeatured = variant === "featured";
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg bg-muted",
        isFeatured
          ? "aspect-[21/9] min-h-[280px] sm:min-h-[360px] md:min-h-[420px] w-full"
          : "aspect-[3/4] min-h-[200px]"
      )}
    >
      <div className="skeleton h-full w-full rounded-lg" />
    </div>
  );
};

export const HomePageSkeleton: FC = () => (
  <main className="min-h-screen">
    <section className="w-full">
      <SkeletonCard variant="featured" />
    </section>
    <section className="container mx-auto px-4 py-12 pb-24">
      <header className="mb-10 text-center">
        <div className="skeleton mx-auto mb-2 h-3 w-20 rounded" />
        <div className="skeleton mx-auto h-9 w-56 rounded" />
      </header>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} variant="default" />
        ))}
      </div>
    </section>
  </main>
);
