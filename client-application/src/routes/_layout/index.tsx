import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, type FC } from "react";
import { EventCard } from "@/components/event-card";
import { HomePageSkeleton } from "@/components/home-page-skeleton";
import { Empty } from "@/components/ui/empty";
import { Icon } from "@iconify/react";
import { useGetAllEvents } from "@/hooks/use-events";
import { eventViewToEvent } from "@/types/event";

const CARD_STAGGER_MS = 50;

const HomePage: FC = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetAllEvents();

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const events =
    data?.pages.flatMap((p) => p.content.map(eventViewToEvent)) ?? [];
  const featured = events[0];
  const gridEvents = featured ? events.slice(1) : events;

  return (
    <>
      {isLoading && <HomePageSkeleton />}

      {!isLoading && (
        <main className="min-h-screen">
          {isError && (
            <div className="container mx-auto px-4 py-8">
              <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                <Icon icon="mdi:alert-circle-outline" className="size-5 shrink-0" />
                <span>{error instanceof Error ? error.message : "Failed to load events"}</span>
              </div>
            </div>
          )}

          {!isError && events.length > 0 && (
            <>
              {featured && (
                <section className="relative w-full animate-card-enter">
                  <Link
                    to="/events/$eventId"
                    params={{ eventId: featured.id }}
                    className="block w-full"
                  >
                    <div className="relative w-full aspect-[21/9] min-h-[280px] sm:min-h-[360px] md:min-h-[420px]">
                      <EventCard
                        event={featured}
                        index={0}
                        variant="featured"
                        className="absolute inset-0 h-full w-full rounded-none"
                      />
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/90">
                          Just enjoy & relax
                        </p>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
                          Your next event awaits
                        </h1>
                        <span className="mt-8 inline-flex rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:bg-primary/90">
                          See event details
                        </span>
                      </div>
                    </div>
                  </Link>
                </section>
              )}

              <section className="container mx-auto px-4 py-12 pb-24">
                <header className="mb-10">
                  <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon icon="mdi:calendar-multiple" className="size-8" aria-hidden />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        Events
                      </p>
                      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Upcoming events
                      </h2>
                    </div>
                  </div>
                </header>

                {gridEvents.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                      {gridEvents.map((event, index) => (
                        <Link
                          key={event.id}
                          to="/events/$eventId"
                          params={{ eventId: event.id }}
                          className="block animate-card-enter opacity-0"
                          style={{
                            animationDelay: `${(featured ? 1 : 0) * CARD_STAGGER_MS + index * CARD_STAGGER_MS}ms`,
                          }}
                        >
                          <EventCard
                            event={event}
                            index={index + (featured ? 1 : 0)}
                            variant="default"
                          />
                        </Link>
                      ))}
                    </div>
                    <div ref={loadMoreRef} className="h-4 w-full" />
                    {isFetchingNextPage && (
                      <div className="mt-8 flex justify-center">
                        <p className="text-sm text-muted-foreground">
                          Loading more…
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-border bg-card py-12">
                    <Empty description="No more events right now." />
                  </div>
                )}
              </section>
            </>
          )}

          {!isError && events.length === 0 && (
            <div className="container mx-auto px-4 py-20">
              <div className="mx-auto max-w-md rounded-xl border border-border bg-card overflow-hidden">
                <div className="bg-linear-to-br from-muted/40 to-transparent px-6 py-12">
                  <Empty description="No events at the moment." />
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </>
  );
};

export const Route = createFileRoute("/_layout/")({
  component: HomePage,
});
