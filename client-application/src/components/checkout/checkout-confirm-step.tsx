import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import type { FC } from "react";

type Props = {
  totalSeats: number;
  isPending: boolean;
  error: Error | null;
  onConfirm: () => void;
};

export const CheckoutConfirmStep: FC<Props> = ({
  totalSeats,
  isPending,
  error,
  onConfirm,
}) => (
  <Card className="overflow-hidden border-primary/20">
    <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent px-6 pt-8 pb-6">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner">
        <Icon icon="mdi:calendar-plus" className="size-8" aria-hidden />
      </div>
      <CardHeader className="space-y-1.5 p-0 text-center">
        <CardTitle className="text-xl">Confirm reservation</CardTitle>
        <CardDescription className="text-balance">
          Hold your seats. You&apos;ll complete payment in the next step.
        </CardDescription>
      </CardHeader>
    </div>
    <CardContent className="space-y-4 pt-6">
      <ul className="space-y-2.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Icon icon="mdi:check" className="size-3.5 text-primary" />
          </span>
          {totalSeats} seat{totalSeats !== 1 ? "s" : ""} reserved for you
        </li>
        <li className="flex items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Icon icon="mdi:check" className="size-3.5 text-primary" />
          </span>
          Payment in the next step
        </li>
      </ul>
      <Button
        className="w-full gap-2 py-6 text-base font-medium"
        size="lg"
        disabled={isPending}
        onClick={onConfirm}
      >
        {isPending ? (
          <>
            <Icon icon="mdi:loading" className="size-5 animate-spin" />
            Creating reservation…
          </>
        ) : (
          <>
            <Icon icon="mdi:calendar-check" className="size-5" />
            Confirm reservation
          </>
        )}
      </Button>
      {error && (
        <p className="flex items-center gap-2 text-sm text-destructive">
          <Icon icon="mdi:alert-circle-outline" className="size-4 shrink-0" />
          {error instanceof Error ? error.message : "Something went wrong"}
        </p>
      )}
    </CardContent>
  </Card>
);
