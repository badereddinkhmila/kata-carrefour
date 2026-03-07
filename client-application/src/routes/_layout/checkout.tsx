import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth-store";
import { useReservationCartStore } from "@/stores/reservation-cart-store";
import { ReservationStatus } from "@/schemas";
import { useLogin } from "@/hooks/use-auth";
import {
  getCartBatchPayload,
  useConfirmReservations,
  useCreateReservationsBatch,
  useMyReservations,
} from "@/hooks/use-events";
import { loginFormSchema, type LoginFormData } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty } from "@/components/ui/empty";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { useEffect, useState, type FC } from "react";

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

type CheckoutStep = "sign-in" | "confirm-reservation" | "complete-payment" | "success";

const CheckoutPage: FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { getItems, getSelectedSeatsForEvent } = useReservationCartStore();
  const items = getItems();
  const { data: myReservations = [] } = useMyReservations();

  const [step, setStep] = useState<CheckoutStep>(
    isAuthenticated ? "confirm-reservation" : "sign-in"
  );
  const [reservedSummary, _setReservedSummary] = useState<{
    eventId: string;
    eventName: string;
    seatCount: number;
  }[] | null>(null);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useLogin({
    onSuccess: () => setStep("confirm-reservation"),
  });

  const createBatchMutation = useCreateReservationsBatch();
  const confirmMutation = useConfirmReservations({
    onSuccess: () => {
      navigate({ to: "/dashboard" });
    },
  });

  useEffect(() => {
    if (!isAuthenticated || items.length === 0) return;
    const pendingSet = new Set(
      myReservations
        .filter((r) => r.status === ReservationStatus.PENDING)
        .map((r) => `${r.eventId}:${r.seatId}`)
    );
    const cartSeatKeys = items.flatMap((entry) =>
      entry.seatIds.map((seatId) => `${entry.eventId}:${seatId}`)
    );
    const allCartSeatsArePending =
      cartSeatKeys.length > 0 &&
      cartSeatKeys.every((key) => pendingSet.has(key));
    if (allCartSeatsArePending) {
      setStep((s) => (s === "confirm-reservation" ? "complete-payment" : s));
    }
  }, [isAuthenticated, items, myReservations]);

  const handleCreateReservation = () => {
    const payload = getCartBatchPayload();
    createBatchMutation.mutate(payload, {
      onSuccess: () => setStep("complete-payment"),
    });
  };

  const handleConfirmPayment = () => {
    const payload = getCartBatchPayload();
    confirmMutation.mutate(payload);
  };

  if (!items.length) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-md rounded-xl border border-border bg-card overflow-hidden">
          <div className="bg-linear-to-br from-muted/40 to-transparent px-6 py-12">
            <Empty description="No reservation in progress.">
              <Button variant="outline" asChild className="gap-2">
                <Link to="/">
                  <Icon icon="mdi:compass-outline" className="size-4" />
                  Browse events
                </Link>
              </Button>
            </Empty>
          </div>
        </div>
      </main>
    );
  }

  const totalSeats = items.reduce((acc, i) => acc + i.seatIds.length, 0);
  const isSuccess = step === "success" && reservedSummary;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 pb-20">
      <div className="mb-8 rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-4 bg-linear-to-br from-muted/60 via-muted/30 to-transparent px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon icon="mdi:cart-check" className="size-7" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Checkout
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {step === "sign-in"
                ? "Sign in to continue with your reservation."
                : step === "confirm-reservation"
                  ? "Review your order and create the reservation."
                  : step === "complete-payment"
                    ? "Complete payment to confirm your reservation."
                    : "Review your order and sign in to confirm your reservation."}
            </p>
          </div>
        </div>
      </div>

      {isSuccess && reservedSummary ? (
        <Card className="max-w-lg border-green-500/20 bg-green-500/5">
          <CardContent className="flex flex-col items-center px-8 pt-12 pb-12 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15 text-green-600 dark:text-green-400 ring-4 ring-green-500/10">
              <Icon icon="mdi:check-circle" className="size-10" aria-hidden />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Reservation confirmed
            </h2>
            <p className="mt-3 max-w-sm text-muted-foreground">
              Your {reservedSummary.reduce((a, e) => a + e.seatCount, 0)} seat
              {reservedSummary.length > 1 || reservedSummary[0].seatCount !== 1 ? "s" : ""} have been reserved
              {reservedSummary.length === 1
                ? ` for ${reservedSummary[0].eventName}`
                : ` across ${reservedSummary.length} events`}.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {reservedSummary.length === 1 ? (
                <Button asChild className="gap-2">
                  <Link
                    to="/events/$eventId"
                    params={{ eventId: reservedSummary[0].eventId }}
                  >
                    <Icon icon="mdi:calendar-eye" className="size-4" />
                    View event
                  </Link>
                </Button>
              ) : (
                reservedSummary.map((e) => (
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
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
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

          <div className="space-y-6">
            {step === "sign-in" && (
              <Card>
                <CardHeader>
                  <CardTitle>Sign in to continue</CardTitle>
                  <CardDescription>
                    Create an account or sign in to proceed with your reservation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form
                    onSubmit={loginForm.handleSubmit((data) =>
                      loginMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="checkout-email">Email</Label>
                      <Input
                        id="checkout-email"
                        type="email"
                        placeholder="you@example.com"
                        {...loginForm.register("email")}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkout-password">Password</Label>
                      <Input
                        id="checkout-password"
                        type="password"
                        {...loginForm.register("password")}
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    {loginMutation.isError && (
                      <p className="text-sm text-destructive">
                        {axios.isAxiosError(loginMutation.error) &&
                        loginMutation.error.response?.data?.message
                          ? String(loginMutation.error.response.data.message)
                          : "Sign in failed"}
                      </p>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in…" : "Sign in"}
                    </Button>
                  </form>
                  <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/register"
                      search={{ redirect: "/checkout" }}
                      className="font-medium text-primary hover:underline"
                    >
                      Register
                    </Link>
                  </p>
                </CardContent>
              </Card>
            )}

            {step === "confirm-reservation" && (
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
                    disabled={createBatchMutation.isPending}
                    onClick={handleCreateReservation}
                  >
                    {createBatchMutation.isPending ? (
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
                  {createBatchMutation.isError && (
                    <p className="flex items-center gap-2 text-sm text-destructive">
                      <Icon icon="mdi:alert-circle-outline" className="size-4 shrink-0" />
                      {createBatchMutation.error instanceof Error
                        ? createBatchMutation.error.message
                        : "Something went wrong"}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {step === "complete-payment" && (
              <Card className="overflow-hidden border-primary/20">
                <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent px-6 pt-8 pb-6">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner">
                    <Icon icon="mdi:credit-card-check-outline" className="size-8" aria-hidden />
                  </div>
                  <CardHeader className="space-y-1.5 p-0 text-center">
                    <CardTitle className="text-xl">Complete payment</CardTitle>
                    <CardDescription className="text-balance">
                      Your seats are reserved. Confirm payment to finalize.
                    </CardDescription>
                  </CardHeader>
                </div>
                <CardContent className="space-y-4 pt-6">
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Icon icon="mdi:shield-check-outline" className="size-3.5 text-primary" />
                      </span>
                      Reservation is secure
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Icon icon="mdi:shield-check-outline" className="size-3.5 text-primary" />
                      </span>
                      One click to confirm
                    </li>
                  </ul>
                  <Button
                    className="w-full gap-2 py-6 text-base font-medium"
                    size="lg"
                    disabled={confirmMutation.isPending}
                    onClick={handleConfirmPayment}
                  >
                    {confirmMutation.isPending ? (
                      <>
                        <Icon icon="mdi:loading" className="size-5 animate-spin" />
                        Confirming…
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:credit-card-sync" className="size-5" />
                        Confirm payment
                      </>
                    )}
                  </Button>
                  {confirmMutation.isError && (
                    <p className="flex items-center gap-2 text-sm text-destructive">
                      <Icon icon="mdi:alert-circle-outline" className="size-4 shrink-0" />
                      {confirmMutation.error instanceof Error
                        ? confirmMutation.error.message
                        : "Something went wrong"}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Button variant="ghost" className="w-full gap-2" asChild>
              <Link to="/">
                <Icon icon="mdi:arrow-left" className="size-4" />
                Back to events
              </Link>
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};

export const Route = createFileRoute("/_layout/checkout")({
  beforeLoad: () => {
    const items = useReservationCartStore.getState().getItems();
    const hasSeats = items.some((i) => i.seatIds.length > 0);
    if (!items.length || !hasSeats) {
      throw redirect({ to: "/" });
    }
  },
  component: CheckoutPage,
});
