import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import type { FC } from "react";

export interface ReservedSummaryItem {
  eventId: string;
  eventName: string;
  seatCount: number;
}

type Props = { summary: ReservedSummaryItem[] };

export const CheckoutSuccessCard: FC<Props> = ({ summary }) => (
  <Card className="max-w-lg border-green-500/20 bg-green-500/5">
    <CardContent className="flex flex-col items-center px-8 pt-12 pb-12 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15 text-green-600 dark:text-green-400 ring-4 ring-green-500/10">
        <Icon icon="mdi:check-circle" className="size-10" aria-hidden />
      </div>
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Reservation confirmed
      </h2>
      <p className="mt-3 max-w-sm text-muted-foreground">
        Your {summary.reduce((a, e) => a + e.seatCount, 0)} seat
        {summary.length > 1 || summary[0].seatCount !== 1 ? "s" : ""} have been reserved
        {summary.length === 1
          ? ` for ${summary[0].eventName}`
          : ` across ${summary.length} events`}.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {summary.length === 1 ? (
          <Button asChild className="gap-2">
            <Link to="/events/$eventId" params={{ eventId: summary[0].eventId }}>
              <Icon icon="mdi:calendar-eye" className="size-4" />
              View event
            </Link>
          </Button>
        ) : (
          summary.map((e) => (
            <Button key={e.eventId} variant="outline" size="sm" asChild className="gap-2">
              <Link to="/events/$eventId" params={{ eventId: e.eventId }}>
                <Icon icon="mdi:calendar" className="size-4" />
                {e.eventName}
              </Link>
            </Button>
          ))
        )}
        <Button variant="outline" asChild className="gap-2">
          <Link to="/">
            <Icon icon="mdi:compass-outline" className="size-4" />
            Browse more events
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);
