"use client";

import * as React from "react";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/client";

type ConfirmFormActionProps = {
    action: (formData: FormData) => Promise<void>;
    label: string | React.ReactNode;
    payload: Record<string, string>;
    title?: string;
    description?: string;
    confirmLabel?: string;
    variant?: React.ComponentProps<typeof Button>["variant"];
    size?: React.ComponentProps<typeof Button>["size"];
    confirmVariant?: React.ComponentProps<typeof Button>["variant"];
    disabled?: boolean;
};

export default function ConfirmFormAction({
    action,
    label,
    payload,
    title = "Are you sure?",
    description = "This action cannot be undone.",
    confirmLabel = "Confirm",
    variant = "outline",
    size = "sm",
    confirmVariant = "destructive",
    disabled,
}: ConfirmFormActionProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant={variant} size={size} disabled={disabled}>
                    {label}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <form action={action} className="inline">
                        {Object.entries(payload).map(([k, v]) => (
                            <input
                                key={k}
                                type="hidden"
                                name={k}
                                defaultValue={v}
                            />
                        ))}
                        <AlertDialogAction asChild>
                            <button
                                type="submit"
                                className={cn(
                                    buttonVariants({
                                        variant: confirmVariant,
                                        size,
                                    }),
                                )}
                            >
                                {confirmLabel}
                            </button>
                        </AlertDialogAction>
                    </form>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
