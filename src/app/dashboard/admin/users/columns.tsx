"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
    ArrowUpDown,
    Shield,
    ShieldOff,
    Trash2,
    UserX,
    UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import ConfirmFormAction from "./confirm-form-action";

export type AdminUser = {
    id: string;
    email: string;
    name?: string | null;
    role?: string | null;
    banned?: boolean | null;
    emailVerified?: boolean | null;
    createdAt?: string | Date | null;
};

interface ActionsProps {
    user: AdminUser;
    banUser: (formData: FormData) => Promise<void>;
    toggleAdmin: (formData: FormData) => Promise<void>;
    removeUser: (formData: FormData) => Promise<void>;
}

function ActionsCell({ user, banUser, toggleAdmin, removeUser }: ActionsProps) {
    const isAdmin = String(user.role ?? "user")
        .split(",")
        .includes("admin");

    return (
        <div className="flex items-center gap-2">
            <ConfirmFormAction
                action={banUser}
                label={
                    user.banned ? (
                        <UserCheck className="h-4 w-4" />
                    ) : (
                        <UserX className="h-4 w-4" />
                    )
                }
                payload={{
                    userId: user.id,
                    banned: String(Boolean(user.banned)),
                }}
                title={user.banned ? "Unban user?" : "Ban user?"}
                description={
                    user.banned
                        ? "This will lift the ban and allow the user to sign in."
                        : "This will ban the user and prevent sign in."
                }
                confirmLabel={user.banned ? "Unban" : "Ban"}
                variant={user.banned ? "default" : "secondary"}
                confirmVariant={user.banned ? "default" : "destructive"}
                size="sm"
            />
            <ConfirmFormAction
                action={toggleAdmin}
                label={
                    isAdmin ? (
                        <ShieldOff className="h-4 w-4" />
                    ) : (
                        <Shield className="h-4 w-4" />
                    )
                }
                payload={{
                    userId: user.id,
                    role: String(user.role ?? "user"),
                }}
                title={isAdmin ? "Demote from admin?" : "Promote to admin?"}
                description={
                    isAdmin
                        ? "The user will lose admin privileges."
                        : "The user will gain admin privileges."
                }
                confirmLabel={isAdmin ? "Demote" : "Promote"}
                variant="outline"
                confirmVariant="secondary"
                size="sm"
            />
            <ConfirmFormAction
                action={removeUser}
                label={<Trash2 className="h-4 w-4" />}
                payload={{ userId: user.id }}
                title="Delete user?"
                description="This will permanently delete the user and their sessions."
                confirmLabel="Delete"
                variant="ghost"
                confirmVariant="destructive"
                size="sm"
            />
        </div>
    );
}

export function createColumns(actions: {
    banUser: (formData: FormData) => Promise<void>;
    toggleAdmin: (formData: FormData) => Promise<void>;
    removeUser: (formData: FormData) => Promise<void>;
}): ColumnDef<AdminUser>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) =>
                        table.toggleAllPageRowsSelected(!!value)
                    }
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "email",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="h-auto p-0 hover:bg-transparent"
                    >
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("email")}</div>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="h-auto p-0 hover:bg-transparent"
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => <div>{row.getValue("name") ?? "—"}</div>,
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {row.getValue("role") ?? "user"}
                </Badge>
            ),
        },
        {
            accessorKey: "emailVerified",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="h-auto p-0 hover:bg-transparent"
                    >
                        Verified
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const verified = row.getValue("emailVerified");
                return (
                    <Badge variant={verified ? "default" : "outline"}>
                        {verified ? "Verified" : "Unverified"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                        className="h-auto p-0 hover:bg-transparent"
                    >
                        Created
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const date = row.getValue("createdAt");
                const validDate =
                    date instanceof Date
                        ? date
                        : typeof date === "string"
                          ? new Date(date)
                          : new Date();
                return (
                    <div className="text-muted-foreground text-sm">
                        {validDate.toLocaleString()}
                    </div>
                );
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <ActionsCell
                        user={user}
                        banUser={actions.banUser}
                        toggleAdmin={actions.toggleAdmin}
                        removeUser={actions.removeUser}
                    />
                );
            },
        },
    ];
}
