"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

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

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(values: SignInFormValues) {
    setServerError(null);

    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          // Redirect to the specified URL or dashboard
          router.push(redirectUrl ?? "/dashboard/home");
        },
        onError: (ctx) => {
          // Handle unverified email - redirect to verify page with redirect param
          if (ctx.error.status === 403) {
            const verifyUrl = redirectUrl
              ? `/auth/verify-email?email=${encodeURIComponent(values.email)}&redirect=${encodeURIComponent(redirectUrl)}`
              : `/auth/verify-email?email=${encodeURIComponent(values.email)}`;
            router.push(verifyUrl);
            return;
          }
          setServerError(ctx.error.message ?? "Invalid email or password");
        },
      },
    );
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
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/auth/forgot-password"
                        className="text-muted-foreground hover:text-primary text-sm underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href={
                redirectUrl
                  ? `/auth/sign-up?redirect=${encodeURIComponent(redirectUrl)}`
                  : "/auth/sign-up"
              }
              className="text-primary hover:text-primary/90 font-medium underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
