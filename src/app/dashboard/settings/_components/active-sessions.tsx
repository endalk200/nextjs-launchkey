import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, LogOut, Smartphone, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import {
    listSessions,
    revokeSession,
    useSession,
} from "@/lib/auth/auth-client";

type Session = {
    id: string;
    token: string;
    userAgent?: string;
    ipAddress?: string;
    createdAt: Date;
    updatedAt: Date;
    isCurrent?: boolean;
};

const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Globe className="h-4 w-4" />;
    if (
        userAgent.includes("Mobile") ||
        userAgent.includes("Android") ||
        userAgent.includes("iPhone")
    ) {
        return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
};

const getDeviceName = (userAgent?: string) => {
    if (!userAgent) return "Unknown Device";
    if (userAgent.includes("Chrome")) return "Chrome Browser";
    if (userAgent.includes("Firefox")) return "Firefox Browser";
    if (userAgent.includes("Safari")) return "Safari Browser";
    if (userAgent.includes("Edge")) return "Edge Browser";
    return "Unknown Browser";
};

export function ActiveSessions() {
    const { data: session } = useSession();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);

    const loadSessions = async () => {
        setLoadingSessions(true);
        const { data } = await listSessions();
        if (data) {
            setSessions(data as Session[]);
        }
        setLoadingSessions(false);
    };

    useEffect(() => {
        void loadSessions();
    }, []);

    const onRevokeSession = async (token: string) => {
        await revokeSession({ token });
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Active Sessions
                    </CardTitle>
                    <CardDescription>
                        Manage your active sessions across different devices.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            onClick={loadSessions}
                            disabled={loadingSessions}
                        >
                            {loadingSessions
                                ? "Refreshing..."
                                : "Refresh Sessions"}
                        </Button>

                        {sessions.length > 0 ? (
                            <div className="space-y-3">
                                {sessions.map((sessionItem) => (
                                    <div
                                        key={sessionItem.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            {getDeviceIcon(
                                                sessionItem.userAgent,
                                            )}
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {getDeviceName(
                                                        sessionItem.userAgent,
                                                    )}
                                                    {sessionItem.isCurrent && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="ml-2 text-xs"
                                                        >
                                                            Current
                                                        </Badge>
                                                    )}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    IP:{" "}
                                                    {sessionItem.ipAddress ??
                                                        "Unknown"}{" "}
                                                    • Last active:{" "}
                                                    {new Date(
                                                        sessionItem.updatedAt,
                                                    ).toLocaleString()}
                                                </p>
                                                {sessionItem.id ===
                                                    session?.session?.id && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        Current Session
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {sessionItem.id !==
                                            session?.session?.id && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    onRevokeSession(
                                                        sessionItem.token,
                                                    )
                                                }
                                            >
                                                <LogOut className="mr-1 h-4 w-4" />
                                                Revoke
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground py-8 text-center">
                                No active sessions found
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
