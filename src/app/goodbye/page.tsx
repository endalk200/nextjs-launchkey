"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Heart, Home } from "lucide-react";
import Link from "next/link";

export default function GoodbyePage() {
  return (
    <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-br p-6">
      <div className="container max-w-2xl">
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader className="space-y-4 pb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-green-800 dark:text-green-200">
                Account Successfully Deleted
              </CardTitle>
              <p className="text-lg text-green-700 dark:text-green-300">
                Your account and all associated data have been permanently
                removed
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We&apos;re sorry to see you go! Your account has been completely
                deleted from our servers, and you&apos;ve been signed out of all
                devices.
              </p>

              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="mb-2 flex items-center justify-center gap-2 font-semibold">
                  <Heart className="h-4 w-4 text-red-500" />
                  Thank you for being part of our community
                </h3>
                <p className="text-muted-foreground text-sm">
                  If you change your mind, you&apos;re always welcome to create
                  a new account. We&apos;d love to have you back!
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return to Home
                </Link>
              </Button>

              <div className="flex flex-col justify-center gap-2 sm:flex-row">
                <Button asChild variant="outline">
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/signup">Create New Account</Link>
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="text-muted-foreground text-xs">
                If you believe this was done in error or need assistance, please
                contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
