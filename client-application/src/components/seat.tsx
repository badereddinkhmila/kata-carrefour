import { type FC } from "react";
import { Armchair, Check, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeatProps {
  seatId: string;
  label?: string;
  available: boolean;
  selected: boolean;
  reservedByMe?: boolean;
  onSelect: (seatId: string) => void;
}

export const Seat: FC<SeatProps> = ({
  seatId,
  label,
  available,
  selected,
  reservedByMe = false,
  onSelect,
}) => {
  const displayLabel = label ?? seatId;
  const isMine = !available && reservedByMe;

  return (
    <button
      type="button"
      onClick={() => available && onSelect(seatId)}
      disabled={!available}
      aria-label={
        isMine
          ? `Seat ${displayLabel} (reserved by you)`
          : available
            ? `Seat ${displayLabel}${selected ? " (selected)" : ""}`
            : `Seat ${displayLabel} (occupied)`
      }
      title={
        isMine
          ? `Seat ${displayLabel} - reserved by you`
          : available
            ? `Seat ${displayLabel}${selected ? " - selected" : " - tap to select"}`
            : `Seat ${displayLabel} - occupied`
      }
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 sm:h-12 sm:w-12",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        (selected || isMine) &&
          "scale-110 border-green-600 text-green-600 dark:border-green-400 dark:text-green-400",
        isMine && "cursor-default",
        selected && !isMine && "cursor-pointer",
        available &&
          !selected &&
          "cursor-pointer border-yellow-500 text-yellow-500 hover:border-yellow-600 hover:text-yellow-600 dark:border-yellow-400 dark:text-yellow-400 dark:hover:border-yellow-300 dark:hover:text-yellow-300 hover:scale-105",
        !available &&
          !reservedByMe &&
          "cursor-not-allowed border-green-600/50 text-green-600/40 dark:border-green-400/50 dark:text-green-400/40 opacity-70"
      )}
    >
      {selected || isMine ? (
        <Check className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
      ) : available ? (
        <Armchair className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
      ) : (
        <User className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2} />
      )}
    </button>
  );
};
