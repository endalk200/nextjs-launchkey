"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, ArrowLeft, Mail } from "lucide-react";

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

const verifyEmailSchema = z.object({
  otp: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d+$/, "Verification code must only contain numbers"),
});

type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const redirectUrl = searchParams.get("redirect");

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [isResending, setIsResending] = React.useState(false);

  const form = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: VerifyEmailFormValues) {
    setServerError(null);
    setSuccess(null);

    const { error } = await authClient.emailOtp.verifyEmail({
      email,
      otp: values.otp,
    });

    if (error) {
      setServerError(error.message ?? "Invalid or expired verification code");
      return;
    }

    // Email verified successfully
    // If there's a redirect URL (e.g., invitation page), go there
    // Otherwise, redirect to sign in
    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      router.push("/auth/sign-in");
    }
  }

  async function resendOtp() {
    setIsResending(true);
    setServerError(null);
    setSuccess(null);

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });

    if (error) {
      setServerError(error.message ?? "Failed to resend verification code");
    } else {
      setSuccess("Verification code sent! Check your inbox.");
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
            <Mail className="text-primary h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Verify your email</CardTitle>
          <CardDescription>
            We sent a verification code to{" "}
            <span className="text-foreground font-medium">{email}</span>
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
                    <FormLabel>Verification Code</FormLabel>
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
                Verify email
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
              href={
                redirectUrl
                  ? `/auth/sign-in?redirect=${encodeURIComponent(redirectUrl)}`
                  : "/auth/sign-in"
              }
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
