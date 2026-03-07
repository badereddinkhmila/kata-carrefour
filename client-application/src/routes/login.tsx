import axios from "axios";
import { Icon } from "@iconify/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/stores/auth-store";
import { useLogin } from "@/hooks/use-auth";
import { loginFormSchema, type LoginFormData } from "@/schemas";
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

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useLogin({
    onSuccess: () => {
      navigate({ to: redirectTo === "/checkout" ? "/checkout" : "/dashboard" });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md border-border/60 shadow-lg shadow-primary/5 dark:shadow-primary/10">
        <CardHeader className="space-y-3 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon icon="mdi:login" className="size-7" aria-hidden />
          </div>
          <div className="space-y-1.5 text-center">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))}>
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
              <Label htmlFor="password">Password</Label>
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
            {loginMutation.isError && (
              <p className="flex items-center gap-2 text-sm text-destructive">
                <Icon icon="mdi:alert-circle-outline" className="size-4 shrink-0" />
                {axios.isAxiosError(loginMutation.error) &&
                loginMutation.error.response?.data?.message
                  ? String(loginMutation.error.response.data.message)
                  : loginMutation.error instanceof Error
                    ? loginMutation.error.message
                    : "Login failed"}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={loginMutation.isPending || form.formState.isSubmitting}
            >
              {loginMutation.isPending ? (
                <>
                  <Icon icon="mdi:loading" className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <Icon icon="mdi:arrow-right" className="size-4" />
                </>
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                search={redirectTo ? { redirect: redirectTo } : { redirect: "/dashboard" }}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "/dashboard",
  }),
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});
