"use client";

import React from "react";
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
import { UserPlus } from "lucide-react";
import { api } from "@/trpc/react";

const addCredentialsSchema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one number",
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export function AddCredentials() {
    const { refetch: refetchProviders } =
        api.account.getAuthProviders.useQuery();
    const setPasswordMutation = api.account.setPassword.useMutation();

    const form = useForm<z.infer<typeof addCredentialsSchema>>({
        resolver: zodResolver(addCredentialsSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onAddCredentials = async (
        values: z.infer<typeof addCredentialsSchema>,
    ) => {
        try {
            await setPasswordMutation.mutateAsync({
                password: values.password,
            });

            toast.success("Password authentication added successfully");
            form.reset();
            // Refetch providers to update UI
            await refetchProviders();
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to add password authentication";
            toast.error(message);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Add Password Authentication
                </CardTitle>
                <CardDescription>
                    Set up email and password authentication for your account.
                    This allows you to sign in without using social providers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onAddCredentials)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Enter your password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Password must be at least 8 characters
                                        with uppercase, lowercase, and numbers.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Confirm your password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            disabled={
                                form.formState.isSubmitting ||
                                setPasswordMutation.isPending
                            }
                        >
                            {form.formState.isSubmitting ||
                            setPasswordMutation.isPending
                                ? "Setting up..."
                                : "Add Password Authentication"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
