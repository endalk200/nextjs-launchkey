export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 px-4 dark:bg-linear-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.08),transparent)] dark:bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.04),transparent)]" />
      {children}
    </div>
  );
}
