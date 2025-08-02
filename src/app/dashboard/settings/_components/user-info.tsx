"use client";

import React, { useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Mail } from "lucide-react";
import { changeEmail, updateUser, useSession } from "@/lib/auth/auth-client";

// Validation schemas
const userInfoSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
});

const emailChangeSchema = z.object({
    newEmail: z.string().email("Please enter a valid email address"),
});

export function UserInfo() {
    const { data: session } = useSession();

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

    // Load user data when session is available
    useEffect(() => {
        if (session?.user) {
            userInfoForm.reset({
                name: session.user.name || "",
            });
        }
    }, [session, userInfoForm]);

    // Form handlers
    const onUpdateUserInfo = async (values: z.infer<typeof userInfoSchema>) => {
        try {
            await updateUser({
                name: values.name,
            });
            toast.success("Profile updated successfully");
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to update profile";
            toast.error(message);
        }
    };

    const onChangeEmail = async (values: z.infer<typeof emailChangeSchema>) => {
        try {
            await changeEmail({
                newEmail: values.newEmail,
                callbackURL: "/dashboard/settings",
            });
            toast.success(
                "Email change verification sent to your current email",
            );
            emailForm.reset();
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to change email";
            toast.error(message);
        }
    };

    return (
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
                                        <Input
                                            placeholder="Enter your full name"
                                            {...field}
                                        />
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
                            <h4 className="mb-2 text-sm font-medium">
                                Current Email
                            </h4>
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4" />
                                {session?.user?.email}
                                {session?.user?.emailVerified && (
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
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
                                        A verification email will be sent to
                                        your current email address to approve
                                        this change.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            disabled={emailForm.formState.isSubmitting}
                        >
                            {emailForm.formState.isSubmitting
                                ? "Sending..."
                                : "Change Email"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
