"use client";

import * as React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import {
    ChartContainer,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

export default function ChartClient({
    data,
}: {
    data: Array<{
        name: string;
        admins: number;
        banned: number;
        regular: number;
    }>;
}) {
    const [series, setSeries] = React.useState(data);

    React.useEffect(() => {
        setSeries(data);
    }, [data]);

    const config: ChartConfig = {
        // admins: { label: "Admins", color: "hsl(var(--primary))" },
        // banned: { label: "Banned", color: "hsl(var(--destructive))" },
        // regular: { label: "Regular", color: "hsl(var(--success, #22c55e))" },
        admins: { label: "Admins", color: "var(--color-chart-1)" },
        banned: { label: "Banned", color: "var(--color-chart-2)" },
        regular: { label: "Regular", color: "var(--color-chart-3)" },
    };

    return (
        <ChartContainer config={config} className="h-64 w-full">
            <AreaChart
                data={series}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    dataKey="name"
                    className="fill-current text-xs"
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    allowDecimals={false}
                    className="fill-current text-xs"
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip
                    cursor={{ stroke: "hsl(var(--muted-foreground))" }}
                    content={<ChartTooltipContent />}
                />
                <Area
                    type="monotone"
                    dataKey="admins"
                    name="Admins"
                    stroke="var(--color-admins)"
                    fill="var(--color-admins)"
                    fillOpacity={0.15}
                />
                <Area
                    type="monotone"
                    dataKey="banned"
                    name="Banned"
                    stroke="var(--color-banned)"
                    fill="var(--color-banned)"
                    fillOpacity={0.15}
                />
                <Area
                    type="monotone"
                    dataKey="regular"
                    name="Regular"
                    stroke="var(--color-regular)"
                    fill="var(--color-regular)"
                    fillOpacity={0.15}
                />
            </AreaChart>
        </ChartContainer>
    );
}
