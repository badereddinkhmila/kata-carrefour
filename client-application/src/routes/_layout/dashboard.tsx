import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useMemo, type FC } from "react";
import { useAuthStore } from "@/stores/auth-store";
import {
  useMyBookedEvents,
  useMyReservations,
  useEventDetails,
} from "@/hooks/use-events";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { ExpiryCountdown } from "@/components/expiry-countdown";
import { Icon } from "@iconify/react";
import { ReservationStatus, type EventView } from "@/schemas";
import type { ReservationView } from "@/schemas";
import type { EventReservationDetailView } from "@/schemas";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ReservationWithSeatLabel = ReservationView & {
  seatLabel: string;
};

function buildEventReservations(
  event: EventView,
  reservations: ReservationView[],
  detail: EventReservationDetailView | undefined
): ReservationWithSeatLabel[] {
  const byEvent = reservations.filter((r) => r.eventId === event.id);
  const seatMap = new Map(
    detail?.seats.map((s) => [s.id, s.seatNumber]) ?? []
  );
  return byEvent.map((r) => ({
    ...r,
    seatLabel: seatMap.get(r.seatId) ?? `Seat ${r.seatId.slice(0, 8)}`,
  }));
}

function getSoonestPendingExpiry(reservations: ReservationView[]): string | null {
  const pending = reservations.filter(
    (r) => r.status === ReservationStatus.PENDING && r.expiresAt
  );
  if (pending.length === 0) return null;
  const sorted = [...pending].sort(
    (a, b) =>
      new Date(a.expiresAt!).getTime() - new Date(b.expiresAt!).getTime()
  );
  return sorted[0].expiresAt!;
}

const DashboardPage: FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { data: eventViews, isLoading: eventsLoading, isError, error } = useMyBookedEvents();
  const {
    data: reservations = [],
    isLoading: reservationsLoading,
    isError: reservationsError,
    error: reservationsErrorDetail,
  } = useMyReservations();

  const eventIds = useMemo(
    () => eventViews?.map((e) => e.id) ?? [],
    [eventViews]
  );
  const detailQueries = useEventDetails(eventIds);

  const activeReservations = useMemo(
    () =>
      reservations.filter(
        (r) => r.status === ReservationStatus.PENDING || r.status === ReservationStatus.CONFIRMED
      ),
    [reservations]
  );

  const eventsWithReservations = useMemo(() => {
    if (!eventViews) return [];
    return eventViews.map((event, index) => {
      const detail = detailQueries[index]?.data;
      const list = buildEventReservations(event, activeReservations, detail);
      const soonestExpiry = getSoonestPendingExpiry(list);
      return {
        event,
        detail,
        reservations: list,
        soonestExpiry,
      };
    });
  }, [eventViews, activeReservations, detailQueries]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login", search: { redirect: "/dashboard" } });
  };

  const isLoading = eventsLoading || reservationsLoading;
  const events = eventViews ?? [];
  const hasReservationsError = Boolean(reservationsError && reservationsErrorDetail);

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8 pb-20">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-linear-to-br from-muted/60 via-muted/30 to-transparent px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon icon="mdi:calendar-check" className="size-7" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                My reservations
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Event details and your reserved seats. Complete pending reservations before they expire.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon icon="mdi:account-outline" className="size-4" />
              {user?.email ?? "User"}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <Icon icon="mdi:logout" className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <section className="mt-8">
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] min-h-[200px] animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            <Icon icon="mdi:alert-circle-outline" className="size-5 shrink-0" />
            <span>{error instanceof Error ? error.message : "Failed to load your events"}</span>
          </div>
        )}

        {hasReservationsError && !isError && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
            <Icon icon="mdi:alert-outline" className="size-5 shrink-0" />
            <span>
              Could not load your reservations (seats and countdown may be missing).{" "}
              {reservationsErrorDetail instanceof Error ? reservationsErrorDetail.message : "Check the network tab for /me/reservations."}
            </span>
          </div>
        )}

        {!isLoading && !isError && events.length === 0 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="bg-linear-to-br from-muted/40 to-transparent px-6 py-6">
              <Empty
                description="You have no reservations yet. Select seats on an event and complete checkout to see them here."
              >
                <Button variant="outline" asChild className="gap-2">
                  <Link to="/">
                    <Icon icon="mdi:compass-outline" className="size-4" />
                    Browse events
                  </Link>
                </Button>
              </Empty>
            </div>
          </div>
        )}

        {!isLoading && !isError && events.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventsWithReservations.map(({ event, detail, reservations: list, soonestExpiry }) => (
              <Link
                key={event.id}
                to="/events/$eventId"
                params={{ eventId: event.id }}
                className="group block"
              >
                <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
                  <div className="relative aspect-[3/2] w-full overflow-hidden bg-muted">
                    <div className="absolute left-3 top-3 z-10 rounded-lg border border-white/20 bg-black/40 px-2 py-1 backdrop-blur-sm">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-white">
                        <Icon icon="mdi:seat-passenger" className="size-3.5" />
                        Reserved
                      </span>
                    </div>
                    {event.banner ? (
                      <img
                        src={event.banner}
                        alt={event.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h2 className="font-semibold leading-tight drop-shadow-sm line-clamp-2">
                        {event.name}
                      </h2>
                      <p className="mt-1 text-xs text-white/90">
                        {formatDate(event.startsAt)}
                      </p>
                      {detail?.room && (
                        <p className="mt-0.5 text-xs text-white/80">
                          {detail.room.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <Icon icon="mdi:seat-outline" className="size-3.5" />
                      Reserved seats
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {list.map((r) => (
                        <span
                          key={r.id}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium",
                            r.status === ReservationStatus.CONFIRMED
                              ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          )}
                        >
                          <Icon icon="mdi:seat" className="size-3.5" />
                          {r.seatLabel}
                          <span className="opacity-90">
                            {r.status === ReservationStatus.PENDING ? "Pending" : "Confirmed"}
                          </span>
                        </span>
                      ))}
                    </div>
                    {list.some((r) => r.status === ReservationStatus.PENDING) && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                        {soonestExpiry ? (
                          <ExpiryCountdown expiresAt={soonestExpiry} />
                        ) : (
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                            Pending — complete your reservation soon
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export const Route = createFileRoute("/_layout/dashboard")({
  beforeLoad: () => {
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: "/dashboard" } });
    }
  },
  component: DashboardPage,
});
