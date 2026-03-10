import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
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
import {
  CheckoutCompletePaymentStep,
  CheckoutConfirmStep,
  CheckoutOrderSummary,
  CheckoutSignInStep,
  CheckoutSuccessCard,
} from "@/components/checkout";
import { Empty } from "@/components/ui/empty";
import { Icon } from "@iconify/react";
import { useEffect, useState, type FC } from "react";

type CheckoutStep = "sign-in" | "confirm-reservation" | "complete-payment" | "success";

const CheckoutPage: FC = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { getItems, getSelectedSeatsForEvent } = useReservationCartStore();
  const items = getItems();
  const { data: myReservations = [] } = useMyReservations();

  const [step, setStep] = useState<CheckoutStep>(
    isAuthenticated ? "confirm-reservation" : "sign-in"
  );
  const [reservedSummary, setReservedSummary] = useState<{
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
      const summary = items.map((entry) => ({
        eventId: entry.eventId,
        eventName: entry.eventSnapshot.eventName,
        seatCount: entry.seatIds.length,
      }));
      setReservedSummary(summary);
      setStep("success");
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
        <CheckoutSuccessCard summary={reservedSummary} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <CheckoutOrderSummary
            items={items}
            getSelectedSeatsForEvent={getSelectedSeatsForEvent}
            totalSeats={totalSeats}
          />
          <div className="space-y-6">
            {step === "sign-in" && (
              <CheckoutSignInStep
                loginForm={loginForm}
                loginMutation={loginMutation}
              />
            )}
            {step === "confirm-reservation" && (
              <CheckoutConfirmStep
                totalSeats={totalSeats}
                isPending={createBatchMutation.isPending}
                error={createBatchMutation.error ?? null}
                onConfirm={handleCreateReservation}
              />
            )}
            {step === "complete-payment" && (
              <CheckoutCompletePaymentStep
                isPending={confirmMutation.isPending}
                error={confirmMutation.error ?? null}
                onConfirm={handleConfirmPayment}
              />
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
