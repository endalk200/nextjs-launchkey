import { EmailLayout } from "./components/email-layout";
import { EmailButton } from "./components/email-button";
import { Text, Heading } from "@react-email/components";

export interface ChangeEmailVerificationProps {
  username: string;
  newEmail: string;
  verificationUrl: string;
}

export function ChangeEmailVerification({
  username,
  newEmail,
  verificationUrl,
}: ChangeEmailVerificationProps) {
  const previewText = "Verify your new email address";

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
        Verify your new email address
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
        You recently requested to change your email address to{" "}
        <strong>{newEmail}</strong>. To complete this change, please verify your
        new email address by clicking the button below.
      </Text>

      <div style={{ textAlign: "center", margin: "32px 0" }}>
        <EmailButton href={verificationUrl}>
          Verify New Email Address
        </EmailButton>
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
        {verificationUrl}
      </Text>

      <Text
        style={{
          fontSize: "14px",
          color: "#059669",
          lineHeight: "20px",
          margin: "24px 0 0 0",
          padding: "16px",
          backgroundColor: "#f0fdf4",
          borderRadius: "6px",
          border: "1px solid #bbf7d0",
        }}
      >
        <strong>Important:</strong> After verification, your old email address
        will no longer be associated with your account. All future
        communications will be sent to {newEmail}.
      </Text>

      <Text
        style={{
          fontSize: "14px",
          color: "#6b7280",
          lineHeight: "20px",
          margin: "16px 0 0 0",
        }}
      >
        This verification link will expire in 24 hours for security reasons.
      </Text>
    </EmailLayout>
  );
}

export default ChangeEmailVerification;
