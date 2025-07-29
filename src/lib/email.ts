import { Resend } from "resend";
import { render } from "@react-email/components";
import { env } from "@/env";

// Import email templates
import { VerifyEmail, type VerifyEmailProps } from "@/emails/verify-email";
import {
  ResetPassword,
  type ResetPasswordProps,
} from "@/emails/reset-password";
import {
  ChangeEmailVerification,
  type ChangeEmailVerificationProps,
} from "@/emails/change-email-verification";
import {
  DeleteAccountConfirmation,
  type DeleteAccountConfirmationProps,
} from "@/emails/delete-account-confirmation";

// Initialize Resend client
const resend = new Resend(env.RESEND_API_KEY ?? "");

// Email service functions
export async function sendVerificationEmail({
  user,
  url,
  token: _token,
}: {
  user: { email: string; name?: string };
  url: string;
  token: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "NextCelerator <support@support.endalk200.com>",
      to: [user.email],
      subject: "Verify your email address",
      react: VerifyEmail({
        username: user.name ?? user.email,
        verificationUrl: url,
      }),
    });

    if (error) {
      console.error("Failed to send verification email:", error);
      throw new Error(
        `Failed to send verification email: ${error.message ?? "Unknown error"}`,
      );
    }

    console.log("Verification email sent successfully:", {
      emailId: data?.id,
      recipient: user.email,
    });
    return data;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail({
  user,
  url,
  token: _token,
}: {
  user: { email: string; name?: string };
  url: string;
  token: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "NextCelerator <support@support.endalk200.com>",
      to: [user.email],
      subject: "Reset your password",
      react: ResetPassword({
        username: user.name ?? user.email,
        resetUrl: url,
      }),
    });

    if (error) {
      console.error("Failed to send password reset email:", error);
      throw new Error(
        `Failed to send password reset email: ${error.message ?? "Unknown error"}`,
      );
    }

    console.log("Password reset email sent successfully:", {
      emailId: data?.id,
      recipient: user.email,
    });
    return data;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

export async function sendChangeEmailVerification({
  user,
  newEmail,
  url,
  token: _token,
}: {
  user: { email: string; name?: string };
  newEmail: string;
  url: string;
  token: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "NextCelerator <support@support.endalk200.com>",
      to: [newEmail], // Send to the new email address
      subject: "Verify your new email address",
      react: ChangeEmailVerification({
        username: user.name ?? user.email,
        newEmail,
        verificationUrl: url,
      }),
    });

    if (error) {
      console.error("Failed to send email change verification:", error);
      throw new Error(
        `Failed to send email change verification: ${error.message ?? "Unknown error"}`,
      );
    }

    console.log("Email change verification sent successfully:", {
      emailId: data?.id,
      newEmail,
      originalEmail: user.email,
    });
    return data;
  } catch (error) {
    console.error("Error sending email change verification:", error);
    throw error;
  }
}

export async function sendDeleteAccountConfirmation({
  user,
  url,
  token: _token,
}: {
  user: { email: string; name?: string };
  url: string;
  token: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "NextCelerator <support@support.endalk200.com>",
      to: [user.email],
      subject: "⚠️ Confirm Account Deletion",
      react: DeleteAccountConfirmation({
        username: user.name ?? user.email,
        confirmationUrl: url,
      }),
    });

    if (error) {
      console.error("Failed to send account deletion confirmation:", error);
      throw new Error(
        `Failed to send account deletion confirmation: ${error.message ?? "Unknown error"}`,
      );
    }

    console.log("Account deletion confirmation sent successfully:", {
      emailId: data?.id,
      recipient: user.email,
    });
    return data;
  } catch (error) {
    console.error("Error sending account deletion confirmation:", error);
    throw error;
  }
}

// Helper function to render email to HTML (useful for testing)
export async function renderEmailToHtml(
  template: "verify",
  props: VerifyEmailProps,
): Promise<string>;
export async function renderEmailToHtml(
  template: "reset",
  props: ResetPasswordProps,
): Promise<string>;
export async function renderEmailToHtml(
  template: "change-email",
  props: ChangeEmailVerificationProps,
): Promise<string>;
export async function renderEmailToHtml(
  template: "delete-account",
  props: DeleteAccountConfirmationProps,
): Promise<string>;
export async function renderEmailToHtml(
  template: "verify" | "reset" | "change-email" | "delete-account",
  props:
    | VerifyEmailProps
    | ResetPasswordProps
    | ChangeEmailVerificationProps
    | DeleteAccountConfirmationProps,
): Promise<string> {
  switch (template) {
    case "verify":
      return await render(VerifyEmail(props as VerifyEmailProps));
    case "reset":
      return await render(ResetPassword(props as ResetPasswordProps));
    case "change-email":
      return await render(
        ChangeEmailVerification(props as ChangeEmailVerificationProps),
      );
    case "delete-account":
      return await render(
        DeleteAccountConfirmation(props as DeleteAccountConfirmationProps),
      );
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}
