import { EmailLayout } from "./components/email-layout";
import { EmailButton } from "./components/email-button";
import { Text, Heading } from "@react-email/components";

export interface VerifyEmailProps {
  username: string;
  verificationUrl: string;
}

export function VerifyEmail({ username, verificationUrl }: VerifyEmailProps) {
  const previewText = "Verify your email address to complete your registration";

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
        Verify your email address
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
        Thank you for signing up! To complete your registration and start using
        NextCelerator, please verify your email address by clicking the button
        below.
      </Text>

      <div style={{ textAlign: "center", margin: "32px 0" }}>
        <EmailButton href={verificationUrl}>Verify Email Address</EmailButton>
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
          color: "#6b7280",
          lineHeight: "20px",
          margin: "24px 0 0 0",
        }}
      >
        This verification link will expire in 24 hours for security reasons.
      </Text>
    </EmailLayout>
  );
}

export default VerifyEmail;
