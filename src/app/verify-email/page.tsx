import { Suspense } from "react";
import { VerifyEmailView } from "./verify-email-view";

export default function VerifyEmailPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    return (
        <Suspense>
            <ResolvedView searchParams={searchParams} />
        </Suspense>
    );
}

async function ResolvedView({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const params = await searchParams;
    const token = (params.token as string) ?? null;
    const error = (params.error as string) ?? null;
    const emailParam = (params.email as string) ?? null;
    return (
        <VerifyEmailView token={token} error={error} emailParam={emailParam} />
    );
}
