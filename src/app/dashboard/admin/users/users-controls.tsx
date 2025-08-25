"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function UsersControls() {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();

    const [q, setQ] = React.useState(sp.get("q") ?? "");
    const role = sp.get("role") ?? "all";
    const banned = sp.get("banned") ?? "all";
    const verified = sp.get("verified") ?? "all";
    const sortBy = sp.get("sortBy") ?? "createdAt";
    const sortDirection = sp.get("sortDirection") ?? "desc";

    React.useEffect(() => {
        setQ(sp.get("q") ?? "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sp.get("q")]);

    const updateParams = React.useCallback(
        (params: Record<string, string | undefined>) => {
            const next = new URLSearchParams(sp.toString());
            Object.entries(params).forEach(([k, v]) => {
                if (!v || v === "" || v === "all") next.delete(k);
                else next.set(k, v);
            });
            // reset to first page on filter/search change
            next.delete("page");
            router.push(`${pathname}?${next.toString()}`);
        },
        [pathname, router, sp],
    );

    const onSearchChange = (value: string) => {
        setQ(value);
        debouncedSet(value);
    };

    const debouncedSet = React.useMemo(() => {
        let t: NodeJS.Timeout | null = null;
        return (value: string) => {
            if (t) clearTimeout(t);
            t = setTimeout(() => updateParams({ q: value }), 300);
        };
    }, [updateParams]);

    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
                <Input
                    placeholder="Search by email or name..."
                    value={q}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="md:max-w-sm"
                />
                <Button
                    variant="ghost"
                    onClick={() => updateParams({ q: "" })}
                    type="button"
                >
                    Clear
                </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Select
                    value={role}
                    onValueChange={(v) => updateParams({ role: v })}
                >
                    <SelectTrigger className="min-w-32">
                        <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All roles</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                        <SelectItem value="user">Users</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={banned}
                    onValueChange={(v) => updateParams({ banned: v })}
                >
                    <SelectTrigger className="min-w-32">
                        <SelectValue placeholder="Banned" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Banned</SelectItem>
                        <SelectItem value="false">Not banned</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={verified}
                    onValueChange={(v) => updateParams({ verified: v })}
                >
                    <SelectTrigger className="min-w-36">
                        <SelectValue placeholder="Verified" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Verified</SelectItem>
                        <SelectItem value="false">Unverified</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={`${sortBy}:${sortDirection}`}
                    onValueChange={(v) => {
                        const [sb, sd] = v.split(":");
                        updateParams({ sortBy: sb, sortDirection: sd });
                    }}
                >
                    <SelectTrigger className="min-w-40">
                        <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="createdAt:desc">Newest</SelectItem>
                        <SelectItem value="createdAt:asc">Oldest</SelectItem>
                        <SelectItem value="email:asc">Email A-Z</SelectItem>
                        <SelectItem value="email:desc">Email Z-A</SelectItem>
                        <SelectItem value="name:asc">Name A-Z</SelectItem>
                        <SelectItem value="name:desc">Name Z-A</SelectItem>
                        <SelectItem value="emailVerified:desc">
                            Verified first
                        </SelectItem>
                        <SelectItem value="emailVerified:asc">
                            Unverified first
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
