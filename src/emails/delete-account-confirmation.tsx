import { EmailLayout } from "./components/email-layout";
import { EmailButton } from "./components/email-button";
import { Text, Heading } from "@react-email/components";

export interface DeleteAccountConfirmationProps {
  username: string;
  confirmationUrl: string;
}

export function DeleteAccountConfirmation({
  username,
  confirmationUrl,
}: DeleteAccountConfirmationProps) {
  const previewText = "Confirm account deletion - This action cannot be undone";

  return (
    <EmailLayout previewText={previewText}>
      <Heading
        style={{
          fontSize: "24px",
          fontWeight: "600",
          color: "#dc2626",
          margin: "0 0 16px 0",
          textAlign: "center",
        }}
      >
        ⚠️ Account Deletion Request
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
        We received a request to permanently delete your NextCelerator account.
        This is a serious action that cannot be undone.
      </Text>

      <div
        style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          padding: "20px",
          margin: "24px 0",
        }}
      >
        <Text
          style={{
            fontSize: "16px",
            color: "#dc2626",
            fontWeight: "600",
            margin: "0 0 12px 0",
          }}
        >
          ⚠️ Warning: This action is permanent and irreversible
        </Text>

        <Text
          style={{
            fontSize: "14px",
            color: "#7f1d1d",
            lineHeight: "20px",
            margin: "0 0 8px 0",
          }}
        >
          • All your account data will be permanently deleted
        </Text>

        <Text
          style={{
            fontSize: "14px",
            color: "#7f1d1d",
            lineHeight: "20px",
            margin: "0 0 8px 0",
          }}
        >
          • You will lose access to all your projects and settings
        </Text>

        <Text
          style={{
            fontSize: "14px",
            color: "#7f1d1d",
            lineHeight: "20px",
            margin: "0",
          }}
        >
          • This action cannot be undone or reversed
        </Text>
      </div>

      <Text
        style={{
          fontSize: "16px",
          color: "#374151",
          lineHeight: "24px",
          margin: "0 0 32px 0",
        }}
      >
        If you&apos;re sure you want to proceed with deleting your account,
        click the button below to confirm:
      </Text>

      <div style={{ textAlign: "center", margin: "32px 0" }}>
        <EmailButton href={confirmationUrl} variant="secondary">
          Confirm Account Deletion
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
        {confirmationUrl}
      </Text>

      <div
        style={{
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "8px",
          padding: "20px",
          margin: "24px 0 0 0",
        }}
      >
        <Text
          style={{
            fontSize: "14px",
            color: "#059669",
            fontWeight: "600",
            margin: "0 0 8px 0",
          }}
        >
          Changed your mind?
        </Text>

        <Text
          style={{
            fontSize: "14px",
            color: "#047857",
            lineHeight: "20px",
            margin: "0",
          }}
        >
          If you didn&apos;t request this deletion or want to keep your account,
          simply ignore this email. Your account will remain active and
          unchanged.
        </Text>
      </div>

      <Text
        style={{
          fontSize: "14px",
          color: "#6b7280",
          lineHeight: "20px",
          margin: "16px 0 0 0",
        }}
      >
        This deletion confirmation link will expire in 24 hours.
      </Text>
    </EmailLayout>
  );
}

export default DeleteAccountConfirmation;
