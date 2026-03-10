import axios from "axios";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FC } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { UseMutationResult } from "@tanstack/react-query";
import type { LoginFormData } from "@/schemas";

type Props = {
  loginForm: UseFormReturn<LoginFormData>;
  loginMutation: UseMutationResult<unknown, Error, LoginFormData>;
};

export const CheckoutSignInStep: FC<Props> = ({ loginForm, loginMutation }) => (
    <Card>
      <CardHeader>
        <CardTitle>Sign in to continue</CardTitle>
        <CardDescription>
          Create an account or sign in to proceed with your reservation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}
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
);
