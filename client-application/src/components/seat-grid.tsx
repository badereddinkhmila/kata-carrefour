import { type FC } from "react";
import { Icon } from "@iconify/react";
import { Seat } from "./seat";

export interface SeatData {
  id: string;
  seatNumber: string;
  reserved: boolean;
  reservedByMe?: boolean;
}

interface SeatGridProps {
  seats?: SeatData[];
  selectedSeatIds?: string[];
  onSeatSelect?: (seatId: string) => void;
  rows?: number;
  columns?: number;
  unavailableSeats?: string[];
  title?: string;
  subtitle?: string;
}

export const SeatGrid: FC<SeatGridProps> = ({
  seats: seatsProp,
  selectedSeatIds = [],
  onSeatSelect,
  rows = 0,
  columns = 0,
  unavailableSeats = [],
  title = "Select your seats",
  subtitle,
}) => {
  const useApiSeats = Array.isArray(seatsProp) && seatsProp.length > 0;

  const availableCount = useApiSeats
    ? seatsProp!.filter((s) => !s.reserved).length
    : rows * columns - unavailableSeats.length;

  const resolvedSubtitle =
    subtitle ?? (useApiSeats ? `${availableCount} seats available` : undefined);

  const handleSelect = (seatId: string) => {
    if (onSeatSelect) {
      onSeatSelect(seatId);
    }
  };

  const content = useApiSeats ? (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {seatsProp!.map((seat) => (
        <Seat
          key={seat.id}
          seatId={seat.id}
          label={seat.seatNumber}
          available={!seat.reserved}
          selected={selectedSeatIds.includes(seat.id)}
          reservedByMe={seat.reservedByMe}
          onSelect={handleSelect}
        />
      ))}
    </div>
  ) : (
    (() => {
      const items: React.ReactNode[] = [];
      for (let i = 0; i < rows; i++) {
        const rowSeats: React.ReactNode[] = [];
        for (let j = 0; j < columns; j++) {
          const seatId = `${String.fromCharCode(65 + i)}${j + 1}`;
          const available = !unavailableSeats.includes(seatId);
          const selected = selectedSeatIds.includes(seatId);
          rowSeats.push(
            <Seat
              key={seatId}
              seatId={seatId}
              label={seatId}
              available={available}
              selected={selected}
              onSelect={handleSelect}
            />
          );
        }
        items.push(
          <div key={`row-${i}`} className="flex justify-center gap-2">
            <div className="flex gap-2">{rowSeats}</div>
          </div>
        );
      }
      return <div className="flex flex-col items-center gap-3">{items}</div>;
    })()
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-linear-to-br from-muted/60 via-muted/30 to-transparent px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon icon="mdi:seat-recline-extra" className="size-7" aria-hidden />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {title}
              </h2>
              {resolvedSubtitle != null && (
                <p className="mt-0.5 text-sm text-muted-foreground">{resolvedSubtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6 md:p-8">
        <div className="flex flex-col items-center gap-4">
          {content}
          <div className="flex w-full max-w-md flex-col items-center gap-2 pt-6">
            <div className="h-1 w-full max-w-xs rounded-full bg-primary/30" />
            <p className="text-sm font-medium text-muted-foreground">Screen</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 px-4 py-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon icon="mdi:information-outline" className="size-4" />
          Legend
        </h3>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-600 text-green-600 dark:border-green-400 dark:text-green-400">
              <Icon icon="mdi:check" className="size-4" />
            </div>
            <span className="text-sm text-muted-foreground">Reserved by me</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-yellow-500 text-yellow-500 dark:border-yellow-400 dark:text-yellow-400">
              <Icon icon="mdi:seat-outline" className="size-4" />
            </div>
            <span className="text-sm text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-600/50 text-green-600/40 dark:border-green-400/50 dark:text-green-400/40 opacity-70">
              <Icon icon="mdi:account-outline" className="size-4" />
            </div>
            <span className="text-sm text-muted-foreground">Already reserved</span>
          </div>
        </div>
      </div>
    </div>
  );
};
