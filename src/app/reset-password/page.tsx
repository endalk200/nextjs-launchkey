import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    return (
        <Suspense>
            {/* Using the server-side searchParams to avoid useSearchParams CSR bailout */}
            <ResolvedForm searchParams={searchParams} />
        </Suspense>
    );
}

async function ResolvedForm({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const params = await searchParams;
    const token = (params.token as string) ?? null;
    const error = (params.error as string) ?? null;
    return <ResetPasswordForm token={token} error={error} />;
}
