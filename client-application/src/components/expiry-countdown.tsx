import { useEffect, useState, type FC } from "react";
import { cn } from "@/lib/utils";

function getRemaining(expiresAt: string): { done: boolean; text: string } {
  const now = Date.now();
  const end = new Date(expiresAt).getTime();
  const ms = Math.max(0, end - now);
  if (ms === 0) return { done: true, text: "Expired" };
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return { done: false, text: `${hours}h ${minutes}m` };
  }
  if (minutes > 0) {
    return { done: false, text: `${minutes}:${seconds.toString().padStart(2, "0")}` };
  }
  return { done: false, text: `${seconds}s` };
}

interface ExpiryCountdownProps {
  expiresAt: string;
  className?: string;
  tickMs?: number;
}

export const ExpiryCountdown: FC<ExpiryCountdownProps> = ({
  expiresAt,
  className,
  tickMs,
}) => {
  const [remaining, setRemaining] = useState(() => getRemaining(expiresAt));

  useEffect(() => {
    setRemaining(getRemaining(expiresAt));
    const interval = setInterval(() => {
      const next = getRemaining(expiresAt);
      setRemaining(next);
      if (next.done) clearInterval(interval);
    }, tickMs ?? 1000);
    return () => clearInterval(interval);
  }, [expiresAt, tickMs]);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        remaining.done ? "text-destructive" : "text-amber-600 dark:text-amber-400",
        className
      )}
      title={remaining.done ? "Reservation expired" : "Time left to complete reservation"}
    >
      {remaining.done ? "Expired" : `Expires in ${remaining.text}`}
    </span>
  );
};
