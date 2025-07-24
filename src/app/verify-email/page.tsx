"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sendVerificationEmail } from "@/lib/auth-client";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const emailParam = searchParams.get("email");

    if (emailParam) {
      setEmail(emailParam);
    }

    if (error) {
      setStatus("error");
      if (error === "invalid_token") {
        toast.error("Invalid or expired verification link");
      } else {
        toast.error("Email verification failed");
      }
    } else if (token) {
      // If we have a token, the verification was handled by Better Auth
      // and we were redirected here, so it was successful
      setStatus("success");
      toast.success("Email verified successfully!");

      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } else {
      // No token or error, this might be a direct visit
      setStatus("error");
    }
  }, [searchParams, router]);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("No email address found. Please try signing in again.");
      return;
    }

    setIsResending(true);
    try {
      const result = await sendVerificationEmail({
        email,
        callbackURL: "/verify-email",
      });

      if (result.error) {
        toast.error(
          result.error.message ?? "Failed to send verification email",
        );
      } else {
        toast.success("Verification email sent! Check your inbox.");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="from-background to-secondary/20 flex min-h-screen items-center justify-center bg-gradient-to-b p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Verifying your email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="from-background to-secondary/20 flex min-h-screen items-center justify-center bg-gradient-to-b p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Email verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. You will be
                redirected to your dashboard shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/">Return to Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="from-background to-secondary/20 flex min-h-screen items-center justify-center bg-gradient-to-b p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="bg-destructive/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
              <XCircle className="text-destructive h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Verification failed</CardTitle>
            <CardDescription>
              This email verification link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {email && (
              <div className="bg-muted flex items-center gap-2 rounded-md p-3">
                <Mail className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">{email}</span>
              </div>
            )}

            {email ? (
              <Button
                onClick={handleResendVerification}
                className="w-full"
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend verification email"
                )}
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link href="/signin">Sign in to verify your email</Link>
              </Button>
            )}

            <Button asChild className="w-full" variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
