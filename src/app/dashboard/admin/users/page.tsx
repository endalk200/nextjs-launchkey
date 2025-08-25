import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import UsersControls from "./users-controls";
import ConfirmFormAction from "./confirm-form-action";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/client";

type AdminUser = {
    id: string;
    email: string;
    name?: string | null;
    role?: string | null;
    banned?: boolean | null;
    emailVerified?: boolean | null;
    createdAt?: string | Date | null;
};

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: {
        page?: string;
        q?: string;
        role?: string;
        banned?: string;
        verified?: string;
        sortBy?: string;
        sortDirection?: "asc" | "desc";
    };
}) {
    const page = Number(searchParams?.page ?? 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const sb = searchParams?.sortBy;
    const sortBy: "createdAt" | "email" | "name" | "emailVerified" =
        sb === "email" || sb === "name" || sb === "emailVerified"
            ? sb
            : "createdAt";
    const sortDirection: "asc" | "desc" =
        searchParams?.sortDirection === "asc" ? "asc" : "desc";
    const q = searchParams?.q ?? undefined;
    const role =
        searchParams?.role && searchParams.role !== "all"
            ? searchParams.role
            : undefined;
    const banned =
        searchParams?.banned === "true"
            ? true
            : searchParams?.banned === "false"
              ? false
              : undefined;
    const emailVerified =
        searchParams?.verified === "true"
            ? true
            : searchParams?.verified === "false"
              ? false
              : undefined;

    const list = await auth.api.listUsers({
        query: {
            limit,
            offset,
            sortBy,
            sortDirection,
            // best-effort search support on server if available
            searchValue: q,
            searchField: q ? ("email" as const) : undefined,
            searchOperator: q ? ("contains" as const) : undefined,
        },
        headers: await headers(),
    });
    const users = (list as unknown as { users: AdminUser[] }).users ?? [];
    // client-side filtering to complement server search
    const filteredUsers = users.filter((u) => {
        if (
            role &&
            !String(u.role ?? "user")
                .split(",")
                .includes(role)
        ) {
            return false;
        }
        if (typeof banned === "boolean" && Boolean(u.banned) !== banned) {
            return false;
        }
        if (
            typeof emailVerified === "boolean" &&
            Boolean(u.emailVerified) !== emailVerified
        ) {
            return false;
        }
        if (q) {
            const hay = `${u.email} ${u.name ?? ""}`.toLowerCase();
            if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
    });
    const total =
        (list as unknown as { total?: number }).total ?? filteredUsers.length;
    const displayUsers = filteredUsers;
    const totalPages = Math.max(1, Math.ceil((total || 1) / limit));

    return (
        <div className="space-y-6 p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold tracking-tight">Users</h1>
            </div>
            <UsersControls />
            <div className="overflow-x-auto rounded-md border">
                <table className="min-w-full text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <ThSortable
                                label="Email"
                                columnKey="email"
                                activeKey={sortBy}
                                direction={sortDirection}
                                baseParams={{
                                    q: q ?? undefined,
                                    role: role ?? undefined,
                                    banned:
                                        typeof banned === "boolean"
                                            ? String(banned)
                                            : undefined,
                                    verified:
                                        typeof emailVerified === "boolean"
                                            ? String(emailVerified)
                                            : undefined,
                                }}
                            />
                            <ThSortable
                                label="Name"
                                columnKey="name"
                                activeKey={sortBy}
                                direction={sortDirection}
                                baseParams={{
                                    q: q ?? undefined,
                                    role: role ?? undefined,
                                    banned:
                                        typeof banned === "boolean"
                                            ? String(banned)
                                            : undefined,
                                    verified:
                                        typeof emailVerified === "boolean"
                                            ? String(emailVerified)
                                            : undefined,
                                }}
                            />
                            <Th>Role</Th>
                            <ThSortable
                                label="Verified"
                                columnKey="emailVerified"
                                activeKey={sortBy}
                                direction={sortDirection}
                                baseParams={{
                                    q: q ?? undefined,
                                    role: role ?? undefined,
                                    banned:
                                        typeof banned === "boolean"
                                            ? String(banned)
                                            : undefined,
                                    verified:
                                        typeof emailVerified === "boolean"
                                            ? String(emailVerified)
                                            : undefined,
                                }}
                            />
                            <ThSortable
                                label="Created"
                                columnKey="createdAt"
                                activeKey={sortBy}
                                direction={sortDirection}
                                baseParams={{
                                    q: q ?? undefined,
                                    role: role ?? undefined,
                                    banned:
                                        typeof banned === "boolean"
                                            ? String(banned)
                                            : undefined,
                                    verified:
                                        typeof emailVerified === "boolean"
                                            ? String(emailVerified)
                                            : undefined,
                                }}
                            />
                            <Th>Actions</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayUsers.map((u: AdminUser) => (
                            <tr key={u.id} className="border-t">
                                <Td>{u.email}</Td>
                                <Td>{u.name}</Td>
                                <Td>{u.role ?? "user"}</Td>
                                <Td>
                                    {u.emailVerified ? (
                                        <Badge variant="secondary">
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">
                                            Unverified
                                        </Badge>
                                    )}
                                </Td>
                                <Td>
                                    {new Date(
                                        u.createdAt ?? Date.now(),
                                    ).toLocaleString()}
                                </Td>
                                <Td>
                                    <div className="flex flex-wrap gap-2 py-2">
                                        <ConfirmFormAction
                                            action={banUser}
                                            label={u.banned ? "Unban" : "Ban"}
                                            payload={{
                                                userId: u.id,
                                                banned: String(
                                                    Boolean(u.banned),
                                                ),
                                            }}
                                            title={
                                                u.banned
                                                    ? "Unban user?"
                                                    : "Ban user?"
                                            }
                                            description={
                                                u.banned
                                                    ? "This will lift the ban and allow the user to sign in."
                                                    : "This will ban the user and prevent sign in."
                                            }
                                            confirmLabel={
                                                u.banned ? "Unban" : "Ban"
                                            }
                                            variant={
                                                u.banned
                                                    ? "secondary"
                                                    : "outline"
                                            }
                                            confirmVariant={
                                                u.banned
                                                    ? "secondary"
                                                    : "destructive"
                                            }
                                            size="sm"
                                        />
                                        <ConfirmFormAction
                                            action={impersonate}
                                            label="Impersonate"
                                            payload={{ userId: u.id }}
                                            title="Impersonate user?"
                                            description="Your session will switch to this user until you sign out."
                                            confirmLabel="Impersonate"
                                            variant="outline"
                                            confirmVariant="secondary"
                                            size="sm"
                                        />
                                        <ConfirmFormAction
                                            action={toggleAdmin}
                                            label={
                                                String(u.role ?? "user")
                                                    .split(",")
                                                    .includes("admin")
                                                    ? "Demote"
                                                    : "Promote"
                                            }
                                            payload={{
                                                userId: u.id,
                                                role: String(u.role ?? "user"),
                                            }}
                                            title={
                                                String(u.role ?? "user")
                                                    .split(",")
                                                    .includes("admin")
                                                    ? "Demote from admin?"
                                                    : "Promote to admin?"
                                            }
                                            description={
                                                String(u.role ?? "user")
                                                    .split(",")
                                                    .includes("admin")
                                                    ? "The user will lose admin privileges."
                                                    : "The user will gain admin privileges."
                                            }
                                            confirmLabel={
                                                String(u.role ?? "user")
                                                    .split(",")
                                                    .includes("admin")
                                                    ? "Demote"
                                                    : "Promote"
                                            }
                                            variant="outline"
                                            confirmVariant={
                                                String(u.role ?? "user")
                                                    .split(",")
                                                    .includes("admin")
                                                    ? "secondary"
                                                    : "secondary"
                                            }
                                            size="sm"
                                        />
                                        <ConfirmFormAction
                                            action={removeUser}
                                            label="Delete"
                                            payload={{ userId: u.id }}
                                            title="Delete user?"
                                            description="This will permanently delete the user and their sessions."
                                            confirmLabel="Delete"
                                            variant="outline"
                                            confirmVariant="destructive"
                                            size="sm"
                                        />
                                    </div>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination
                page={page}
                totalPages={totalPages}
                baseParams={{
                    q: q ?? undefined,
                    role: role ?? undefined,
                    banned:
                        typeof banned === "boolean"
                            ? String(banned)
                            : undefined,
                    verified:
                        typeof emailVerified === "boolean"
                            ? String(emailVerified)
                            : undefined,
                    sortBy,
                    sortDirection,
                }}
            />
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return (
        <th className="px-3 py-2 text-left text-xs font-medium tracking-wider uppercase">
            {children}
        </th>
    );
}

function ThSortable({
    label,
    columnKey,
    activeKey,
    direction,
    baseParams = {},
}: {
    label: string;
    columnKey: "createdAt" | "email" | "name" | "emailVerified";
    activeKey: string;
    direction: "asc" | "desc";
    baseParams?: Record<string, string | undefined>;
}) {
    const isActive = activeKey === columnKey;
    const nextDirection = isActive && direction === "asc" ? "desc" : "asc";
    const params = new URLSearchParams();
    Object.entries(baseParams).forEach(([k, v]) => {
        if (v) params.set(k, v);
    });
    params.set("sortBy", columnKey);
    params.set("sortDirection", nextDirection);
    params.delete("page");
    return (
        <th className="px-3 py-2 text-left text-xs font-medium tracking-wider uppercase">
            <a
                href={`?${params.toString()}`}
                className={cn(
                    "inline-flex items-center gap-1 hover:underline",
                    isActive && "text-foreground",
                )}
            >
                {label}
                <span className="text-muted-foreground">
                    {isActive ? (direction === "asc" ? "▲" : "▼") : ""}
                </span>
            </a>
        </th>
    );
}

function Td({ children }: { children: React.ReactNode }) {
    return <td className="px-3 py-2 align-middle">{children}</td>;
}

function Pagination({
    page,
    totalPages,
    baseParams = {},
}: {
    page: number;
    totalPages: number;
    baseParams?: Record<string, string | undefined>;
}) {
    const prev = Math.max(1, page - 1);
    const next = Math.min(totalPages, page + 1);
    const makeHref = (p: number) => {
        const params = new URLSearchParams();
        Object.entries(baseParams).forEach(([k, v]) => {
            if (v) params.set(k, v);
        });
        params.set("page", String(p));
        return `?${params.toString()}`;
    };
    return (
        <div className="flex items-center justify-between">
            <a className="text-sm underline" href={makeHref(prev)}>
                Previous
            </a>
            <div className="text-sm">
                Page {page} of {totalPages}
            </div>
            <a className="text-sm underline" href={makeHref(next)}>
                Next
            </a>
        </div>
    );
}

async function banUser(formData: FormData) {
    "use server";
    const userId = (formData.get("userId") as string) ?? "";
    const banned = ((formData.get("banned") as string) ?? "false") === "true";
    if (banned) {
        await auth.api.unbanUser({
            body: { userId },
            headers: await headers(),
        });
    } else {
        await auth.api.banUser({ body: { userId }, headers: await headers() });
    }
    revalidatePath("/dashboard/admin/users");
}

async function impersonate(formData: FormData) {
    "use server";
    const userId = (formData.get("userId") as string) ?? "";
    await auth.api.impersonateUser({
        body: { userId },
        headers: await headers(),
    });
    // stays on page; session switches to impersonated user
}

async function toggleAdmin(formData: FormData) {
    "use server";
    const userId = (formData.get("userId") as string) ?? "";
    const role = (formData.get("role") as string) ?? "user";
    const hasAdmin = role
        .split(",")
        .map((r) => r.trim())
        .includes("admin");
    const nextRoles: Array<"admin" | "user"> = hasAdmin
        ? ["user"]
        : ["admin", "user"];
    await auth.api.setRole({
        body: { userId, role: nextRoles },
        headers: await headers(),
    });
    revalidatePath("/dashboard/admin/users");
}

async function removeUser(formData: FormData) {
    "use server";
    const userId = (formData.get("userId") as string) ?? "";
    await auth.api.removeUser({ body: { userId }, headers: await headers() });
    revalidatePath("/dashboard/admin/users");
}

// FormAction removed in favor of ConfirmFormAction
