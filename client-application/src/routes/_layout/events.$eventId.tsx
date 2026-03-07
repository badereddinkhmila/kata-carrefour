import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FC } from "react";
import { useReservationCartStore } from "@/stores/reservation-cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useEventDetail, useEventSeatsStream, useMyReservations } from "@/hooks/use-events";
import { ReservationStatus } from "@/schemas";
import { SeatGrid } from "@/components/seat-grid";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { ExpiryCountdown } from "@/components/expiry-countdown";
import { Icon } from "@iconify/react";

const HERO_GRADIENT =
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const EventDetailPage: FC = () => {
  const { eventId } = Route.useParams();
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.user?.id);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  const { data: detail, isLoading, isError, error } = useEventDetail(eventId);
  const { data: myReservations = [] } = useMyReservations();

  useEventSeatsStream(eventId, {
    enabled: Boolean(eventId) && !isLoading && !isError,
  });

  const myReservedSeatIds = useMemo(
    () =>
      myReservations
        .filter(
          (reservation) =>
            reservation.eventId === eventId &&
            (reservation.status === ReservationStatus.PENDING || reservation.status === ReservationStatus.CONFIRMED)
        )
        .map((reservation) => reservation.seatId),
    [eventId, myReservations]
  );

  const pendingForEvent = useMemo(
    () =>
      myReservations.filter(
        (reservation) => reservation.eventId === eventId && reservation.status === ReservationStatus.PENDING
      ),
    [eventId, myReservations]
  );

  const soonestPendingExpiry =
    pendingForEvent.length > 0 && pendingForEvent.some((reservation) => reservation.expiresAt)
      ? pendingForEvent
          .filter((reservation) => reservation.expiresAt)
          .sort(
            (reservationA, reservationB) =>
              new Date(reservationA.expiresAt!).getTime() -
              new Date(reservationB.expiresAt!).getTime()
          )[0]?.expiresAt ?? null
      : null;

  useEffect(() => {
    const { removeEvent, addOrUpdateEvent } = useReservationCartStore.getState();
    if (selectedSeatIds.length === 0) {
      removeEvent(eventId);
    } else if (detail) {
      addOrUpdateEvent(eventId, detail, selectedSeatIds);
    }
  }, [eventId, detail, selectedSeatIds]);

  if (isLoading) {
    return (
      <main className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-muted-foreground">Loading event…</p>
      </main>
    );
  }

  if (isError || !detail) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-destructive">
          <Icon icon="mdi:alert-circle-outline" className="size-6 shrink-0" />
          <span>{error instanceof Error ? error.message : "Event not found"}</span>
        </div>
        <Button variant="ghost" className="mt-4 gap-2" asChild>
          <Link to="/">
            <Icon icon="mdi:arrow-left" className="size-4" />
            Back to events
          </Link>
        </Button>
      </main>
    );
  }

  const availableCount = detail.seats.filter((s) => !s.reserved).length;
  const seatData = detail.seats.map((s) => ({
    id: s.id,
    seatNumber: s.seatNumber,
    reserved: s.reserved,
    reservedByMe:
      myReservedSeatIds.includes(s.id) ||
      (s.reserved && userId != null && s.reservedByUserId === userId),
  }));

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeatIds((current) =>
      current.includes(seatId)
        ? current.filter((id) => id !== seatId)
        : [...current, seatId]
    );
  };

  const handleCompletePayment = () => {
    if (!detail || pendingForEvent.length === 0) return;
    const pendingSeatIds = pendingForEvent.map((r) => r.seatId);
    useReservationCartStore.getState().addOrUpdateEvent(eventId, detail, pendingSeatIds);
    navigate({ to: "/checkout" });
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 pb-20 pt-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 -ml-1 gap-2 text-muted-foreground hover:text-foreground"
        asChild
      >
        <Link to="/">
          <Icon icon="mdi:arrow-left" className="size-4" />
          Back to events
        </Link>
      </Button>

      <section className="relative mb-8 overflow-hidden rounded-2xl">
        <div className="aspect-[21/9] min-h-[220px] sm:min-h-[280px]">
          {detail.banner ? (
            <img
              src={detail.banner}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{ background: HERO_GRADIENT }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <Icon icon="mdi:calendar-star" className="size-3.5" />
            Event
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl">
            {detail.eventName}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/90">
            <span className="flex items-center gap-2">
              <Icon icon="mdi:calendar-clock-outline" className="size-4" />
              {formatDateTime(detail.startsAt)}
            </span>
            <span className="flex items-center gap-2">
              <Icon icon="mdi:map-marker-outline" className="size-4" />
              {detail.room.name}
            </span>
          </div>
        </div>
      </section>

      <div className="mb-6 flex items-center justify-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
        <Icon icon="mdi:map-marker-outline" className="size-5 text-primary" />
        <span className="font-medium text-foreground">{detail.room.name}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-sm text-muted-foreground">
          {detail.room.capacity} seats
        </span>
      </div>

      {pendingForEvent.length > 0 && (
        <Card className="mb-6 overflow-hidden border-amber-500/30 bg-amber-500/5">
          <div className="bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Icon icon="mdi:credit-card-clock-outline" className="size-6" aria-hidden />
              </div>
              <div>
                <CardTitle className="text-base">Pending reservations</CardTitle>
                <CardDescription className="mt-0.5">
                  You have {pendingForEvent.length} seat{pendingForEvent.length !== 1 ? "s" : ""} reserved but not yet confirmed.
                  {soonestPendingExpiry && (
                    <span className="mt-2 flex items-center gap-1">
                      <ExpiryCountdown expiresAt={soonestPendingExpiry} />
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </div>
          <CardContent className="pt-4">
            <Button
              onClick={handleCompletePayment}
              className="w-full gap-2 sm:w-auto"
            >
              <Icon icon="mdi:credit-card-sync" className="size-4" />
              Complete payment
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <section>
          <SeatGrid
            seats={seatData}
            selectedSeatIds={selectedSeatIds}
            onSeatSelect={handleSeatSelect}
            title="Select your seats"
            subtitle={`${availableCount} seats available`}
          />

          {selectedSeatIds.length > 0 && (
            <p className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              <Icon icon="mdi:cart-outline" className="size-4 text-primary shrink-0" />
              {selectedSeatIds.length} seat{selectedSeatIds.length !== 1 ? "s" : ""} selected. Open the cart in the navbar to proceed to checkout.
            </p>
          )}
        </section>

        <aside>
          <Card className="sticky top-24 overflow-hidden">
            <div className="bg-linear-to-br from-muted/60 via-muted/30 to-transparent px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon icon="mdi:map-marker-outline" className="size-6" aria-hidden />
                </div>
                <div>
                  <CardTitle className="text-lg">{detail.room.name}</CardTitle>
                  <CardDescription className="mt-0.5">Venue</CardDescription>
                </div>
              </div>
            </div>
            <CardContent className="space-y-4 pt-5">
              <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/30 px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">Capacity</span>
                <span className="text-lg font-semibold">{detail.room.capacity} seats</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">Available</span>
                <span className="text-lg font-semibold text-primary">{availableCount} seats</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/30 px-4 py-3">
                <Icon icon="mdi:calendar-clock-outline" className="size-4 text-muted-foreground" />
                <span className="text-sm">{formatDateTime(detail.startsAt)}</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
};

export const Route = createFileRoute("/_layout/events/$eventId")({
  component: EventDetailPage,
});
