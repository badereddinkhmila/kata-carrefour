import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import type { FC } from "react";
import type { CartEntry } from "@/stores/reservation-cart-store";
import type { ReservationCartItem } from "@/stores/reservation-cart-store";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type Props = {
  items: CartEntry[];
  getSelectedSeatsForEvent: (eventId: string) => ReservationCartItem[];
  totalSeats: number;
};

export const CheckoutOrderSummary: FC<Props> = ({
  items,
  getSelectedSeatsForEvent,
  totalSeats,
}) => (
  <Card className="overflow-hidden">
    <div className="bg-linear-to-br from-muted/60 via-muted/30 to-transparent px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon icon="mdi:clipboard-list-outline" className="size-6" aria-hidden />
        </div>
        <div>
          <CardTitle className="text-lg">Order summary</CardTitle>
          <CardDescription className="mt-0.5">
            {items.length} event{items.length !== 1 ? "s" : ""} · {totalSeats} seat{totalSeats !== 1 ? "s" : ""}
          </CardDescription>
        </div>
      </div>
    </div>
    <CardContent className="space-y-5 pt-5">
      {items.map((entry, index) => {
        const seats = getSelectedSeatsForEvent(entry.eventId);
        return (
          <div
            key={entry.eventId}
            className={cn(
              "rounded-xl border border-border/80 bg-muted/30 p-4 transition-colors hover:bg-muted/40",
              index > 0 && "mt-4"
            )}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon icon="mdi:calendar-star" className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                <h3 className="font-semibold leading-tight text-foreground">
                  {entry.eventSnapshot.eventName}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Icon icon="mdi:calendar-clock-outline" className="size-4 shrink-0" />
                    {formatDateTime(entry.eventSnapshot.startsAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon icon="mdi:map-marker-outline" className="size-4 shrink-0" />
                    {entry.eventSnapshot.room.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seats.map((item) => (
                    <span
                      key={item.seatId}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/80 px-2.5 py-1.5 text-sm font-medium text-foreground shadow-sm"
                    >
                      <Icon icon="mdi:seat-outline" className="size-4 text-primary" />
                      {item.seatNumber}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <span className="flex items-center gap-2 font-medium text-foreground">
          <Icon icon="mdi:counter" className="size-5 text-primary" />
          Total seats
        </span>
        <span className="text-lg font-semibold text-foreground">
          {totalSeats} seat{totalSeats !== 1 ? "s" : ""}
        </span>
      </div>
    </CardContent>
  </Card>
);
