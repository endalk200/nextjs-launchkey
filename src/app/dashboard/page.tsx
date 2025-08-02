import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { api } from "@/trpc/server";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/signin");
    }

    const { user } = session;

    const userInfo = await api.account.getUserInfo();

    return (
        <div className="container mx-auto space-y-8 p-6">
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                        Here you can manage your account and settings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        <p>
                            Welcome back, {user?.name}! Your account was created
                            on {user?.createdAt?.toLocaleDateString()} at{" "}
                            {user?.createdAt?.toLocaleTimeString()} and last
                            logged in on {userInfo.provider}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
