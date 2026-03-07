import { useState, type FC } from "react";
import type { Event } from "@/types/event";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface EventCardProps {
  event: Event;
  index?: number;
  variant?: "default" | "featured";
  className?: string;
}

export const EventCard: FC<EventCardProps> = ({
  event,
  index = 0,
  variant = "default",
  className,
}) => {
  const gradient =
    PLACEHOLDER_GRADIENTS[Math.abs(index) % PLACEHOLDER_GRADIENTS.length];
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasImage = Boolean(event.imageUrl);
  const isFeatured = variant === "featured";

  return (
    <Card
      className={cn(
        "group overflow-hidden border-0 bg-transparent shadow-none transition-all duration-300 ease-out",
        isFeatured
          ? "aspect-[21/9] min-h-[200px] sm:min-h-[280px]"
          : "aspect-[3/4] cursor-pointer hover:scale-[1.03] hover:shadow-xl",
        className
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-lg">
        {hasImage ? (
          <>
            {!imageLoaded && (
              <div
                className="skeleton absolute inset-0 h-full min-h-[200px] w-full rounded-lg sm:min-h-[260px]"
                aria-hidden
              />
            )}
            <img
              src={event.imageUrl}
              alt={event.title}
              loading="lazy"
              className={cn(
                "h-full w-full object-cover transition-opacity duration-300 group-hover:scale-105",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              style={imageLoaded ? undefined : { position: "absolute", inset: 0 }}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
            style={{ background: gradient }}
          />
        )}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
            isFeatured && "from-black/70 via-transparent to-transparent"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-end p-4 text-white",
            isFeatured && "justify-center p-6 sm:p-10 md:p-12"
          )}
        >
          <Badge
            variant="secondary"
            className="mb-2 w-fit border-white/20 bg-white/20 text-white backdrop-blur-sm"
          >
            {event.category}
          </Badge>
          <h3
            className={cn(
              "font-semibold leading-tight text-white drop-shadow-sm",
              isFeatured
                ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                : "text-lg line-clamp-2"
            )}
          >
            {event.title}
          </h3>
          <p className="mt-1 text-sm text-white/90">
            {formatDate(event.date)}
            {event.location && ` · ${event.location}`}
          </p>
          {isFeatured && event.description && (
            <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
