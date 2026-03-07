import { useRef, type FC } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Link } from "@tanstack/react-router";
import type { Event } from "@/types/event";
import { EventCard } from "@/components/event-card";
import { cn } from "@/lib/utils";

const ROW_HEIGHT = 560;
const GAP = 24;
const COLS_LG = 4;

interface EventsVirtualGridProps {
  events: Event[];
  columns?: number;
  className?: string;
  staggerMs?: number;
}

export const EventsVirtualGrid: FC<EventsVirtualGridProps> = ({
  events,
  columns = COLS_LG,
  className,
  staggerMs = 50,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowCount = Math.ceil(events.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT + GAP,
    overscan: 1,
  });

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={cn("max-h-[70vh] overflow-auto rounded-xl", className)}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualRows.map((virtualRow) => {
          const start = virtualRow.index * columns;
          const rowEvents = events.slice(start, start + columns);
          return (
            <div
              key={virtualRow.key}
              className="absolute left-0 top-0 grid w-full gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              style={{
                height: ROW_HEIGHT + GAP,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rowEvents.map((event, colIndex) => (
                <Link
                  key={event.id}
                  to="/events/$eventId"
                  params={{ eventId: event.id }}
                  className="block animate-card-enter opacity-0"
                  style={{
                    animationDelay: `${virtualRow.index * staggerMs + colIndex * (staggerMs / 2)}ms`,
                  }}
                >
                  <EventCard
                    event={event}
                    index={start + colIndex}
                    variant="default"
                  />
                </Link>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
