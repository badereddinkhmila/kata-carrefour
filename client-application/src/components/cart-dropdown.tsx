import { type FC } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useReservationCartStore } from "@/stores/reservation-cart-store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Empty } from "@/components/ui/empty";

export const CartDropdown: FC = () => {
  const items = useReservationCartStore((s) => s.getItems());
  const getTotalSeatCount = useReservationCartStore((s) => s.getTotalSeatCount);
  const removeEvent = useReservationCartStore((s) => s.removeEvent);

  const total = getTotalSeatCount();

  const getSeatNumbers = (entry: (typeof items)[0]) =>
    entry.seatIds
      .map((id) => entry.eventSnapshot.seats.find((s) => s.id === id)?.seatNumber)
      .filter((n): n is string => n != null);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-lg"
          aria-label={`Cart with ${total} seat${total !== 1 ? "s" : ""}`}
        >
          <ShoppingBag className="h-5 w-5" strokeWidth={2} />
          {total > 0 && (
            <span
              className={cn(
                "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground"
              )}
            >
              {total}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-3 py-2.5">
          <h3 className="font-semibold text-foreground">Reservation cart</h3>
          <p className="text-xs text-muted-foreground">
            {total} seat{total !== 1 ? "s" : ""} across {items.length} event{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="max-h-[min(60vh,320px)] overflow-y-auto">
          {items.length === 0 ? (
            <Empty
              description="Your cart is empty. Select seats on an event to add them."
              className="py-8 px-3"
            />
          ) : (
            <ul className="py-1">
              {items.map((entry) => {
                const seatNumbers = getSeatNumbers(entry);
                return (
                  <li
                    key={entry.eventId}
                    className="flex flex-col gap-1 border-b border-border/60 px-3 py-2 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-foreground text-sm line-clamp-2">
                        {entry.eventSnapshot.eventName}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${entry.eventSnapshot.eventName} from cart`}
                        onClick={(e) => {
                          e.preventDefault();
                          removeEvent(entry.eventId);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Seats: {seatNumbers.join(", ")}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-border p-2">
            <Button className="w-full gap-2" size="sm" asChild>
              <Link to="/checkout">Proceed to checkout</Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
