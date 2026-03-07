import axios from "axios";
import { Icon } from "@iconify/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth-store";
import { useRegister } from "@/hooks/use-auth";
import { registerFormSchema, type RegisterFormData } from "@/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type FC } from "react";

const RegisterPage: FC = () => {
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerMutation = useRegister({
    onSuccess: () => {
      navigate({ to: redirectTo === "/checkout" ? "/checkout" : "/dashboard" });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md border-border/60 shadow-lg shadow-primary/5 dark:shadow-primary/10">
        <CardHeader className="space-y-3 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon icon="mdi:account-plus-outline" className="size-7" aria-hidden />
          </div>
          <div className="space-y-1.5 text-center">
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>
              Enter your details to get started
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon icon="mdi:email-outline" className="size-5" aria-hidden />
                </span>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (min 8 characters)</Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Icon icon="mdi:lock-outline" className="size-5" aria-hidden />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            {registerMutation.isError && (
              <p className="flex items-center gap-2 text-sm text-destructive">
                <Icon icon="mdi:alert-circle-outline" className="size-4 shrink-0" />
                {axios.isAxiosError(registerMutation.error) &&
                registerMutation.error.response?.data?.message
                  ? String(registerMutation.error.response.data.message)
                  : registerMutation.error instanceof Error
                    ? registerMutation.error.message
                    : "Registration failed"}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={registerMutation.isPending || form.formState.isSubmitting}
            >
              {registerMutation.isPending ? (
                <>
                  <Icon icon="mdi:loading" className="size-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <Icon icon="mdi:account-plus" className="size-4" />
                  Create account
                </>
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                search={redirectTo ? { redirect: redirectTo } : { redirect: "/dashboard" }}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "/dashboard",
  }),
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: RegisterPage,
});
