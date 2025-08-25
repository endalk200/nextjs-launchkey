import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    try {
        // Ensure the current user has permission to access admin area
        const result = await auth.api.userHasPermission({
            body: {
                permissions: {
                    user: ["list"],
                },
            },
            headers: await headers(),
        });

        if (!result?.success) {
            redirect("/dashboard");
        }
    } catch {
        // If the check fails for any reason, treat as unauthorized
        redirect("/dashboard");
    }

    return <>{children}</>;
}
