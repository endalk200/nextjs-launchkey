"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  User,
  Mail,
  Lock,
  HeadphonesIcon,
  Copy,
  Check,
} from "lucide-react";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/server/better-auth/client";

// Profile form schema
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Email form schema
const emailFormSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address"),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

// Password form schema
const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

// User data interface
interface UserData {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Profile form state
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Email form state
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Password form state
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Copy button states
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [copiedDraftEmail, setCopiedDraftEmail] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  // Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      newEmail: "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);

      const { data: session } = await authClient.getSession();
      if (session?.user) {
        // Cast to include additional fields that better-auth doesn't infer
        const sessionUser = session.user as typeof session.user & {
          firstName?: string;
          lastName?: string;
        };
        const userData: UserData = {
          id: sessionUser.id,
          name: sessionUser.name,
          firstName: sessionUser.firstName ?? "",
          lastName: sessionUser.lastName ?? "",
          email: sessionUser.email,
          image: sessionUser.image ?? null,
        };
        setUser(userData);
        profileForm.reset({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [profileForm]);

  useEffect(() => {
    void fetchUserData();
  }, [fetchUserData]);

  // Profile form submission
  async function onProfileSubmit(values: ProfileFormValues) {
    setProfileError(null);
    setProfileSuccess(null);

    try {
      // Use type assertion for additional fields that better-auth doesn't infer
      const updateData = {
        name: `${values.firstName} ${values.lastName}`,
        firstName: values.firstName,
        lastName: values.lastName,
      } as Parameters<typeof authClient.updateUser>[0];

      const { error } = await authClient.updateUser(updateData);

      if (error) {
        setProfileError(error.message ?? "Failed to update profile");
        return;
      }

      setProfileSuccess("Profile updated successfully");
      // Update local state
      if (user) {
        setUser({
          ...user,
          firstName: values.firstName,
          lastName: values.lastName,
          name: `${values.firstName} ${values.lastName}`,
        });
      }
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    }
  }

  // Email form submission
  async function onEmailSubmit(values: EmailFormValues) {
    setEmailError(null);
    setEmailSuccess(null);

    try {
      const { error } = await authClient.changeEmail({
        newEmail: values.newEmail,
        callbackURL: "/dashboard/settings",
      });

      if (error) {
        setEmailError(error.message ?? "Failed to update email");
        return;
      }

      setEmailSuccess(
        "A verification email has been sent to your new email address. Please check your inbox and verify to complete the change.",
      );
      emailForm.reset();
    } catch (err) {
      setEmailError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    }
  }

  // Password form submission
  async function onPasswordSubmit(values: PasswordFormValues) {
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        setPasswordError(error.message ?? "Failed to change password");
        return;
      }

      setPasswordSuccess("Password changed successfully");
      passwordForm.reset();
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    }
  }

  // Copy functions
  const copyToClipboard = async (
    text: string,
    setCopied: (value: boolean) => void,
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const copyDraftEmail = async () => {
    const draftEmail = `Subject: Support Request

User ID: ${user?.id ?? "N/A"}
Email: ${user?.email ?? "N/A"}

---
Please describe your issue below:

`;

    await copyToClipboard(draftEmail, setCopiedDraftEmail);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Information Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <User className="text-primary h-4 w-4" />
              </div>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
                            disabled={profileForm.formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            disabled={profileForm.formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {profileError && (
                  <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                    {profileError}
                  </div>
                )}

                {profileSuccess && (
                  <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                    {profileSuccess}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={profileForm.formState.isSubmitting}
                  >
                    {profileForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Email Settings Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <Mail className="text-primary h-4 w-4" />
              </div>
              <div>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Change your email address. A verification email will be sent
                  to your new address.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Email</label>
                  <Input
                    value={user?.email ?? ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-muted-foreground text-xs">
                    This is your current email address.
                  </p>
                </div>

                <FormField
                  control={emailForm.control}
                  name="newEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="newemail@example.com"
                          disabled={emailForm.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the new email address you want to use.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {emailError && (
                  <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                    {emailError}
                  </div>
                )}

                {emailSuccess && (
                  <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                    {emailSuccess}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={emailForm.formState.isSubmitting}
                  >
                    {emailForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Email
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Password Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <Lock className="text-primary h-4 w-4" />
              </div>
              <div>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Change your password to keep your account secure.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
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
                          placeholder="••••••••"
                          disabled={passwordForm.formState.isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            disabled={passwordForm.formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
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
                            placeholder="••••••••"
                            disabled={passwordForm.formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {passwordError && (
                  <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                    {passwordSuccess}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={passwordForm.formState.isSubmitting}
                  >
                    {passwordForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Change Password
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Support Information Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                <HeadphonesIcon className="text-primary h-4 w-4" />
              </div>
              <div>
                <CardTitle>Support Information</CardTitle>
                <CardDescription>
                  Use this information when contacting support for faster
                  assistance.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account Details - Compact Grid */}
            <div className="rounded-lg border p-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground w-24 text-sm font-medium">
                      User ID
                    </span>
                    <span className="font-mono text-sm">
                      {user?.id ?? "N/A"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() =>
                      copyToClipboard(user?.id ?? "", setCopiedUserId)
                    }
                    disabled={!user?.id}
                  >
                    {copiedUserId ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Draft Email */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Need Help?</p>
                <p className="text-muted-foreground text-sm">
                  Copy a pre-filled draft email with your account details.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={copyDraftEmail}>
                {copiedDraftEmail ? (
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copiedDraftEmail ? "Copied!" : "Copy Draft Email"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
