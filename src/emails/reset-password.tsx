import { EmailLayout } from "./components/email-layout";
import { EmailButton } from "./components/email-button";
import { Text, Heading } from "@react-email/components";

export interface ResetPasswordProps {
  username: string;
  resetUrl: string;
}

export function ResetPassword({ username, resetUrl }: ResetPasswordProps) {
  const previewText = "Reset your password for your NextCelerator account";

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
        Reset your password
      </Heading>

      <Text
        style={{
          fontSize: "16px",
          color: "#374151",
          lineHeight: "24px",
          margin: "0 0 24px 0",
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
        We received a request to reset the password for your NextCelerator
        account. If you requested this password reset, click the button below to
        create a new password.
      </Text>

      <div style={{ textAlign: "center", margin: "32px 0" }}>
        <EmailButton href={resetUrl}>Reset Password</EmailButton>
      </div>

      <Text
        style={{
          fontSize: "14px",
          color: "#6b7280",
          lineHeight: "20px",
          margin: "24px 0 0 0",
        }}
      >
        If the button doesn&apos;t work, you can copy and paste this link into
        your browser:
      </Text>

      <Text
        style={{
          fontSize: "14px",
          color: "#6b46c1",
          lineHeight: "20px",
          margin: "8px 0 0 0",
          wordBreak: "break-all",
        }}
      >
        {resetUrl}
      </Text>

      <Text
        style={{
          fontSize: "14px",
          color: "#dc2626",
          lineHeight: "20px",
          margin: "24px 0 0 0",
          padding: "16px",
          backgroundColor: "#fef2f2",
          borderRadius: "6px",
          border: "1px solid #fecaca",
        }}
      >
        <strong>Security Notice:</strong> If you didn&apos;t request this
        password reset, please ignore this email or contact support if you have
        concerns about your account security.
      </Text>

      <Text
        style={{
          fontSize: "14px",
          color: "#6b7280",
          lineHeight: "20px",
          margin: "16px 0 0 0",
        }}
      >
        This password reset link will expire in 1 hour for security reasons.
      </Text>
    </EmailLayout>
  );
}

export default ResetPassword;
