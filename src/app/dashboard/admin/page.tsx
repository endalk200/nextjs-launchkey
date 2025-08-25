import { db } from "@/server/db";
import ChartClient from "./chart-client";

export default async function AdminDashboardPage() {
    const stats = await getStats();

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-xl font-semibold tracking-tight">
                Admin Dashboard
            </h1>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard title="Total Users" value={stats.totalUsers} />
                <StatCard title="Admins" value={stats.adminUsers} />
                <StatCard title="Banned Users" value={stats.bannedUsers} />
            </div>
            <UserBreakdownAreaChart
                data={buildAreaSeries(stats.usersByMonth)}
                totals={{
                    total: stats.totalUsers,
                    admins: stats.adminUsers,
                    banned: stats.bannedUsers,
                }}
            />
        </div>
    );
}

async function getStats() {
    const [totalUsers, adminUsers, bannedUsers, usersByMonth] =
        await Promise.all([
            db.user.count(),
            db.user.count({ where: { role: { contains: "admin" } } }),
            db.user.count({ where: { banned: true } }),
            getUsersByMonth(),
        ]);
    return { totalUsers, adminUsers, bannedUsers, usersByMonth };
}

async function getUsersByMonth() {
    // Get users from the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const users = await db.user.findMany({
        where: {
            createdAt: {
                gte: sixMonthsAgo,
            },
        },
        select: {
            createdAt: true,
            role: true,
            banned: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    // Group users by month
    const monthlyData = new Map<
        string,
        { admins: number; banned: number; regular: number }
    >();

    users.forEach((user) => {
        const monthKey = user.createdAt.toISOString().slice(0, 7); // YYYY-MM format
        const existing = monthlyData.get(monthKey) ?? {
            admins: 0,
            banned: 0,
            regular: 0,
        };

        if (user.banned) {
            existing.banned++;
        } else if (user.role?.includes("admin")) {
            existing.admins++;
        } else {
            existing.regular++;
        }

        monthlyData.set(monthKey, existing);
    });

    // Convert to array and fill missing months with cumulative data
    const result = [];
    const now = new Date();
    let cumulativeAdmins = 0;
    let cumulativeBanned = 0;
    let cumulativeRegular = 0;

    for (let i = 5; i >= 0; i--) {
        const targetMonth = now.getMonth() - i;
        const targetYear =
            targetMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const adjustedMonth = targetMonth < 0 ? targetMonth + 12 : targetMonth;

        // Use UTC to avoid timezone issues
        const date = new Date(Date.UTC(targetYear, adjustedMonth, 1));
        const monthKey = date.toISOString().slice(0, 7);
        const monthName = date.toLocaleDateString("en-US", {
            month: "short",
            timeZone: "UTC",
        });

        const monthData = monthlyData.get(monthKey) ?? {
            admins: 0,
            banned: 0,
            regular: 0,
        };

        // Add this month's registrations to cumulative totals
        cumulativeAdmins += monthData.admins;
        cumulativeBanned += monthData.banned;
        cumulativeRegular += monthData.regular;

        result.push({
            name: monthName,
            admins: cumulativeAdmins,
            banned: cumulativeBanned,
            regular: cumulativeRegular,
        });
    }

    return result;
}

function StatCard({ title, value }: { title: string; value: number }) {
    return (
        <div className="rounded-md border p-4">
            <div className="text-muted-foreground text-xs uppercase">
                {title}
            </div>
            <div className="mt-2 text-2xl font-bold">{value}</div>
        </div>
    );
}

function buildAreaSeries(
    usersByMonth: Array<{
        name: string;
        admins: number;
        banned: number;
        regular: number;
    }>,
): Array<{ name: string; admins: number; banned: number; regular: number }> {
    // Use real monthly data from the database
    return usersByMonth;
}

function UserBreakdownAreaChart({
    data,
    totals,
}: {
    data: Array<{
        name: string;
        admins: number;
        banned: number;
        regular: number;
    }>;
    totals: { total: number; admins: number; banned: number };
}) {
    return (
        <div className="rounded-md border p-4">
            <div className="mb-3 flex items-center justify-between">
                <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    User Growth (Cumulative Last 6 Months)
                </div>
                <div className="text-muted-foreground text-xs">
                    Total:{" "}
                    <span className="text-foreground font-medium">
                        {totals.total}
                    </span>
                </div>
            </div>
            {/* Client boundary for interactive chart */}
            <ChartClient data={data} />
        </div>
    );
}
