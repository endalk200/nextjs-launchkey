"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Lock,
  Trash2,
  Monitor,
  Smartphone,
  Globe,
  LogOut,
} from "lucide-react";
import {
  authClient,
  changeEmail,
  changePassword,
  updateUser,
  deleteUser,
  listSessions,
  revokeSession,
  useSession,
} from "@/lib/auth-client";

// Validation schemas
const userInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const emailChangeSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address"),
});

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type Session = {
  id: string;
  token: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
  isCurrent?: boolean;
};

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const userInfoForm = useForm<z.infer<typeof userInfoSchema>>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      name: "",
    },
  });

  const emailForm = useForm<z.infer<typeof emailChangeSchema>>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: {
      newEmail: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Load user data when session is available
  useEffect(() => {
    if (session?.user) {
      userInfoForm.reset({
        name: session.user.name || "",
      });
    }
  }, [session, userInfoForm]);

  // Load sessions
  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const { data } = await listSessions();
      if (data) {
        setSessions(data as Session[]);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  // Form handlers
  const onUpdateUserInfo = async (values: z.infer<typeof userInfoSchema>) => {
    try {
      await updateUser({
        name: values.name,
      });
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    }
  };

  const onChangeEmail = async (values: z.infer<typeof emailChangeSchema>) => {
    try {
      await changeEmail({
        newEmail: values.newEmail,
        callbackURL: "/dashboard/settings",
      });
      toast.success("Email change verification sent to your current email");
      emailForm.reset();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to change email";
      toast.error(message);
    }
  };

  const onChangePassword = async (
    values: z.infer<typeof passwordChangeSchema>,
  ) => {
    try {
      await changePassword({
        newPassword: values.newPassword,
        currentPassword: values.currentPassword,
        revokeOtherSessions: true,
      });
      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to change password";
      toast.error(message);
    }
  };

  const onRevokeSession = async (token: string) => {
    try {
      await revokeSession({ token });
      toast.success("Session revoked successfully");
      void loadSessions(); // Reload sessions
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to revoke session";
      toast.error(message);
    }
  };

  const onDeleteAccount = async () => {
    try {
      await deleteUser({
        callbackURL: "/",
      });
      toast.success("Account deletion verification sent to your email");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to delete account";
      toast.error(message);
    }
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Globe className="h-4 w-4" />;
    if (
      userAgent.includes("Mobile") ||
      userAgent.includes("Android") ||
      userAgent.includes("iPhone")
    ) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceName = (userAgent?: string) => {
    if (!userAgent) return "Unknown Device";
    if (userAgent.includes("Chrome")) return "Chrome Browser";
    if (userAgent.includes("Firefox")) return "Firefox Browser";
    if (userAgent.includes("Safari")) return "Safari Browser";
    if (userAgent.includes("Edge")) return "Edge Browser";
    return "Unknown Browser";
  };

  // Check if user has email/password authentication by checking if they can change password
  // This will be true if the user signed up with email/password or set a password
  const hasEmailPassword = true; // Show password section by default, better-auth will handle validation

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="mb-8 flex items-center gap-2">
        <User className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Account Settings</h1>
      </div>

      {/* User Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your account details and personal information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...userInfoForm}>
            <form
              onSubmit={userInfoForm.handleSubmit(onUpdateUserInfo)}
              className="space-y-4"
            >
              <FormField
                control={userInfoForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={userInfoForm.formState.isSubmitting}
              >
                {userInfoForm.formState.isSubmitting
                  ? "Updating..."
                  : "Update Profile"}
              </Button>
            </form>
          </Form>

          <Separator />

          {/* Email Change Form */}
          <Form {...emailForm}>
            <form
              onSubmit={emailForm.handleSubmit(onChangeEmail)}
              className="space-y-4"
            >
              <div>
                <h4 className="mb-2 text-sm font-medium">Current Email</h4>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  {session?.user?.email}
                  {session?.user?.emailVerified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              <FormField
                control={emailForm.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter new email address"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A verification email will be sent to your current email
                      address to approve this change.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={emailForm.formState.isSubmitting}>
                {emailForm.formState.isSubmitting
                  ? "Sending..."
                  : "Change Email"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Sessions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage your active sessions across different devices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={loadSessions}
              disabled={loadingSessions}
            >
              {loadingSessions ? "Refreshing..." : "Refresh Sessions"}
            </Button>

            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((sessionItem) => (
                  <div
                    key={sessionItem.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(sessionItem.userAgent)}
                      <div>
                        <p className="text-sm font-medium">
                          {getDeviceName(sessionItem.userAgent)}
                          {sessionItem.isCurrent && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Current
                            </Badge>
                          )}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          IP: {sessionItem.ipAddress ?? "Unknown"} • Last
                          active:{" "}
                          {new Date(sessionItem.updatedAt).toLocaleString()}
                        </p>
                        {sessionItem.id === session?.session?.id && (
                          <Badge variant="secondary" className="text-xs">
                            Current Session
                          </Badge>
                        )}
                      </div>
                    </div>
                    {sessionItem.id !== session?.session?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRevokeSession(sessionItem.token)}
                      >
                        <LogOut className="mr-1 h-4 w-4" />
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center">
                No active sessions found
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Password Section - Only show if user has email/password account */}
      {hasEmailPassword && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password & Security
            </CardTitle>
            <CardDescription>
              Change your password to keep your account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onChangePassword)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Password must be at least 8 characters with uppercase,
                        lowercase, and numbers.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                >
                  {passwordForm.formState.isSubmitting
                    ? "Changing..."
                    : "Change Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Account Deletion Section */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers. A
                  verification email will be sent to confirm this action.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Send Deletion Email
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
