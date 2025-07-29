import { Button } from "@react-email/components";

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export function EmailButton({
  href,
  children,
  variant = "primary",
}: EmailButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Button
      href={href}
      style={{
        backgroundColor: isPrimary ? "#6b46c1" : "#f3f4f6", // primary vs secondary
        color: isPrimary ? "#ffffff" : "#374151",
        padding: "12px 24px",
        borderRadius: "6px",
        textDecoration: "none",
        fontWeight: "500",
        fontSize: "14px",
        display: "inline-block",
        border: isPrimary ? "none" : "1px solid #d1d5db",
        textAlign: "center" as const,
      }}
    >
      {children}
    </Button>
  );
}
