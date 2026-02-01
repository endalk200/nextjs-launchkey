"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, ArrowLeft, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/server/better-auth/client";

const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .length(6, "Reset code must be 6 digits")
      .regex(/^\d+$/, "Reset code must only contain numbers"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isResending, setIsResending] = React.useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: ResetPasswordFormValues) {
    setServerError(null);
    setSuccess(null);

    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp: values.otp,
      password: values.password,
    });

    if (error) {
      setServerError(error.message ?? "Failed to reset password");
      return;
    }

    // Password reset successful, redirect to sign in
    router.push("/auth/sign-in");
  }

  async function resendOtp() {
    setIsResending(true);
    setServerError(null);
    setSuccess(null);

    const { error } = await authClient.forgetPassword.emailOtp({
      email,
    });

    if (error) {
      setServerError(error.message ?? "Failed to resend reset code");
    } else {
      setSuccess("Reset code sent! Check your inbox.");
    }

    setIsResending(false);
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="bg-primary text-primary-foreground mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-semibold">
          CM
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Your App</h1>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Lock className="text-primary h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            Enter the code sent to{" "}
            <span className="text-foreground font-medium">{email}</span> and
            your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reset Code</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        disabled={isLoading}
                        className="text-center font-mono text-lg tracking-[0.5em]"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                  {serverError}
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset password
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground text-sm"
              onClick={resendOtp}
              disabled={isResending}
            >
              {isResending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
              Didn&apos;t receive the code? Resend
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/auth/sign-in"
              className="text-muted-foreground hover:text-foreground inline-flex items-center text-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
