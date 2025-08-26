import { EmailLayout } from "./components/email-layout";
import { EmailButton } from "./components/email-button";
import { Text, Heading } from "@react-email/components";

export interface AdminPromotionProps {
  username: string;
  adminUrl: string;
}

export function AdminPromotion({ username, adminUrl }: AdminPromotionProps) {
  const previewText = "You\u2019ve been granted admin access on NextCelerator";

  return (
    <EmailLayout previewText={previewText}>
      <Heading
        style={{
          fontSize: "24px",
          fontWeight: "600",
          color: "#111827",
          margin: "0 0 16px 0",
          textAlign: "center",
        }}
      >
        You&apos;re now an admin 🎉
      </Heading>

      <Text
        style={{
          fontSize: "16px",
          color: "#374151",
          lineHeight: "24px",
          margin: "0 0 16px 0",
        }}
      >
        Hi {username},
      </Text>

      <Text
        style={{
          fontSize: "16px",
          color: "#374151",
          lineHeight: "24px",
          margin: "0 0 24px 0",
        }}
      >
        You&apos;ve been promoted to an administrator on NextCelerator. You now have
        access to admin tools including user management and analytics.
      </Text>

      <div style={{ textAlign: "center", margin: "32px 0" }}>
        <EmailButton href={adminUrl}>Go to Admin Dashboard</EmailButton>
      </div>

      <Text
        style={{
          fontSize: "14px",
          color: "#6b7280",
          lineHeight: "20px",
          margin: "24px 0 0 0",
        }}
      >
        Tip: Please keep your account secure and follow least-privilege
        principles when managing users and settings.
      </Text>
    </EmailLayout>
  );
}

export default AdminPromotion;
