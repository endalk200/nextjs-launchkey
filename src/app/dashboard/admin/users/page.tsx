import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import UsersControls from "./users-controls";
import { UsersDataTable } from "./users-data-table";
import { type AdminUser } from "./columns";

export default async function AdminUsersPage({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{
        page?: string;
        q?: string;
        role?: string;
        banned?: string;
        verified?: string;
        sortBy?: string;
        sortDirection?: "asc" | "desc";
    }>;
}) {
    const searchParams = await searchParamsPromise;
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
            <UsersDataTable
                data={displayUsers}
                page={page}
                totalPages={totalPages}
                pageSize={limit}
                totalItems={total}
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
                actions={{
                    banUser,
                    toggleAdmin,
                    removeUser,
                }}
            />
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
    // Note: Could add admin promotion email notification here if needed
    revalidatePath("/dashboard/admin/users");
}

async function removeUser(formData: FormData) {
    "use server";
    const userId = (formData.get("userId") as string) ?? "";
    await auth.api.removeUser({ body: { userId }, headers: await headers() });
    revalidatePath("/dashboard/admin/users");
}
