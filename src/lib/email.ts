import { Resend, type CreateEmailResponseSuccess } from "resend";
import { render } from "@react-email/components";
import { env } from "@/env";
import type { Result } from "neverthrow";
import { ok, err } from "neverthrow";
import { safeAwait } from "@/lib/utils/safe-await";

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
import {
    AdminPromotion,
    type AdminPromotionProps,
} from "@/emails/admin-promotion";

const resend = new Resend(env.RESEND_API_KEY ?? "");

export type EmailServiceError =
    | { type: "INVALID_RESEND_API_KEY"; message: string }
    | { type: "INVALID_EMAIL"; message: string }
    | { type: "RATE_LIMITED"; message: string; retryAfter?: number }
    | { type: "PERMANENT_FAILURE"; message: string }
    | { type: "TEMPORARY_FAILURE"; message: string }
    | { type: "UNKNOWN_ERROR"; message: string };

type SendVerificationEmailArgs = {
    user: { email: string; name?: string };
    url: string;
    token: string;
};

export async function sendVerificationEmail({
    user,
    url,
    token: _token,
}: SendVerificationEmailArgs): Promise<
    Result<CreateEmailResponseSuccess, EmailServiceError>
> {
    const [response, error] = await safeAwait(
        resend.emails.send({
            from: "NextCelerator <support@support.endalk200.com>",
            to: [user.email],
            subject: "Verify your email address",
            react: VerifyEmail({
                username: user.name ?? user.email,
                verificationUrl: url,
            }),
        }),
    );

    if (error) {
        console.log(
            `[sendVerificationEmail] Failed to send verification email:`,
            error,
        );
        return err({
            type: "UNKNOWN_ERROR",
            message: `Failed to send verification email, please try again later`,
        });
    }

    if (response.error) {
        switch (response.error.name) {
            case "rate_limit_exceeded":
                console.log(
                    `[sendVerificationEmail] rate_limited error: ${response.error.name}: ${response.error.message}`,
                );
                return err({
                    type: "RATE_LIMITED",
                    message: `Failed to send verification email, please try again later`,
                });
            default:
                console.error(
                    `[sendVerificationEmail] Failed to send verification email: ${response.error.name}: ${response.error.message}`,
                );
                return err({
                    type: "UNKNOWN_ERROR",
                    message: `Failed to send verification email, please try again later`,
                });
        }
    }

    if (!response.data) {
        console.error(
            `[sendVerificationEmail] Failed to send verication email, no response data:`,
            response,
        );
        return err({
            type: "UNKNOWN_ERROR",
            message: `Failed to send verification email, please try again later`,
        });
    }

    console.log(
        `[sendVerificationEmail] Verification email sent successfully: ${response.data?.id}`,
        {
            emailId: response.data?.id,
            recipient: user.email,
        },
    );

    return ok(response.data);
}

type SendPasswordResetEmailArgs = {
    user: { email: string; name?: string };
    url: string;
    token: string;
};

export async function sendPasswordResetEmail({
    user,
    url,
    token: _token,
}: SendPasswordResetEmailArgs): Promise<
    Result<CreateEmailResponseSuccess, EmailServiceError>
> {
    const [response, error] = await safeAwait(
        resend.emails.send({
            from: "NextCelerator <support@support.endalk200.com>",
            to: [user.email],
            subject: "Reset your password",
            react: ResetPassword({
                username: user.name ?? user.email,
                resetUrl: url,
            }),
        }),
    );

    if (error) {
        console.log(
            `[sendPasswordResetEmail] Failed to send password reset email:`,
            error,
        );
        return err({
            type: "UNKNOWN_ERROR",
            message: `Failed to send password reset email, please try again later`,
        });
    }

    if (response.error) {
        switch (response.error.name) {
            case "rate_limit_exceeded":
                console.log(
                    `[sendPasswordResetEmail] rate_limited error: ${response.error.name}: ${response.error.message}`,
                );
                return err({
                    type: "RATE_LIMITED",
                    message: `Failed to send password reset email, please try again later`,
                });
            default:
                console.error(
                    `[sendPasswordResetEmail] Failed to send password reset email: ${response.error.name}: ${response.error.message}`,
                );
                return err({
                    type: "UNKNOWN_ERROR",
                    message: `Failed to send password reset email, please try again later`,
                });
        }
    }

    if (!response.data) {
        console.error(
            `[sendPasswordResetEmail] Failed to send password reset email, no response data:`,
            response,
        );
        return err({
            type: "UNKNOWN_ERROR",
            message: `Failed to send password reset email, please try again later`,
        });
    }

    console.log(
        `[sendPasswordResetEmail] Password reset email sent successfully: ${response.data?.id}`,
        {
            emailId: response.data?.id,
            recipient: user.email,
        },
    );

    return ok(response.data);
}

type SendChangeEmailVerificationArgs = {
    user: { email: string; name?: string };
    newEmail: string;
    url: string;
    token: string;
};

export async function sendChangeEmailVerification({
    user,
    newEmail,
    url,
    token: _token,
}: SendChangeEmailVerificationArgs): Promise<
    Result<CreateEmailResponseSuccess, EmailServiceError>
> {
    const [response, error] = await safeAwait(
        resend.emails.send({
            from: "NextCelerator <support@support.endalk200.com>",
            to: [newEmail],
            subject: "Verify your new email address",
            react: ChangeEmailVerification({
                username: user.name ?? user.email,
                newEmail,
                verificationUrl: url,
            }),
        }),
    );

    if (error) {
        console.log(
            `[sendChangeEmailVerification] Failed to send email change verification:`,
            error,
        );
        return err({
            type: "UNKNOWN_ERROR",
            message: `Failed to send email change verification, please try again later`,
        });
    }

    if (response.error) {
        switch (response.error.name) {
            case "rate_limit_exceeded":
                console.log(
                    `[sendChangeEmailVerification] rate_limited error: ${response.error.name}: ${response.error.message}`,
                );
                return err({
                    type: "RATE_LIMITED",
                    message: `Failed to send email change verification, please try again later`,
                });
            default:
                console.error(
                    `[sendChangeEmailVerification] Failed to send email change verification: ${response.error.name}: ${response.error.message}`,
                );
                return err({
                    type: "UNKNOWN_ERROR",
                    message: `Failed to send email change verification, please try again later`,
                });
        }
    }

    if (!response.data) {
        console.error(
            `[sendChangeEmailVerification] Failed to send email change verification, no response data:`,
            response,
        );
        return err({
            type: "UNKNOWN_ERROR",
            message: `Failed to send email change verification, please try again later`,
        });
    }

    console.log(
        `[sendChangeEmailVerification] Email change verification sent successfully: ${response.data?.id}`,
        {
            emailId: response.data?.id,
            newEmail,
            originalEmail: user.email,
        },
    );

    return ok(response.data);
}

type SendDeleteAccountConfirmationArgs = {
    user: { email: string; name?: string };
    url: string;
    token: string;
};

export async function sendDeleteAccountConfirmation({
    user,
    url,
    token: _token,
}: SendDeleteAccountConfirmationArgs): Promise<
    Result<CreateEmailResponseSuccess, EmailServiceError>
> {
    const [response, error] = await safeAwait(
        resend.emails.send({
            from: "NextCelerator <support@support.endalk200.com>",
            to: [user.email],
            subject: "⚠️ Confirm Account Deletion",
            react: DeleteAccountConfirmation({
                username: user.name ?? user.email,
                confirmationUrl: url,
            }),
        }),
    );

    if (error) {
        console.log(
            `[sendDeleteAccountConfirmation] Failed to send account deletion confirmation:`,
            error,
        );
        return err({
            type: "UNKNOWN_ERROR",
            message: `Failed to send account deletion confirmation, please try again later`,
        });
    }

    if (response.error) {
        switch (response.error.name) {
            case "rate_limit_exceeded":
                console.log(
                    `[sendDeleteAccountConfirmation] rate_limited error: ${response.error.name}: ${response.error.message}`,
                );
                return err({
                    type: "RATE_LIMITED",
                    message: `Failed to send account deletion confirmation, please try again later`,
                });
            default:
                console.error(
                    `[sendDeleteAccountConfirmation] Failed to send account deletion confirmation: ${response.error.name}: ${response.error.message}`,
                );
                return err({
                    type: "UNKNOWN_ERROR",
                    message: `Failed to send account deletion confirmation, please try again later`,
                });
        }
    }

    if (!response.data) {
        console.error(
            `[sendDeleteAccountConfirmation] Failed to send account deletion confirmation, no response data:`,
            response,
        );
        return err({
            type: "UNKNOWN_ERROR",
            message: `Failed to send account deletion confirmation, please try again later`,
        });
    }

    console.log(
        `[sendDeleteAccountConfirmation] Account deletion confirmation sent successfully: ${response.data?.id}`,
        {
            emailId: response.data?.id,
            recipient: user.email,
        },
    );

    return ok(response.data);
}

type SendAdminPromotionEmailArgs = {
    user: { email: string; name?: string };
    adminUrl: string;
};

export async function sendAdminPromotionEmail({
    user,
    adminUrl,
}: SendAdminPromotionEmailArgs): Promise<
    Result<CreateEmailResponseSuccess, EmailServiceError>
> {
    const [response, error] = await safeAwait(
        resend.emails.send({
            from: "NextCelerator <support@support.endalk200.com>",
            to: [user.email],
            subject: "You're now an admin on NextCelerator",
            react: AdminPromotion({
                username: user.name ?? user.email,
                adminUrl,
            }),
        }),
    );

    if (error) {
        console.log(
            `[sendAdminPromotionEmail] Failed to send admin promotion email:`,
            error,
        );
        return err({
            type: "UNKNOWN_ERROR",
            message: `Failed to send admin promotion email, please try again later`,
        });
    }

    if (response.error) {
        switch (response.error.name) {
            case "rate_limit_exceeded":
                console.log(
                    `[sendAdminPromotionEmail] rate_limited error: ${response.error.name}: ${response.error.message}`,
                );
                return err({
                    type: "RATE_LIMITED",
                    message: `Failed to send admin promotion email, please try again later`,
                });
            default:
                console.error(
                    `[sendAdminPromotionEmail] Failed to send admin promotion email: ${response.error.name}: ${response.error.message}`,
                );
                return err({
                    type: "UNKNOWN_ERROR",
                    message: `Failed to send admin promotion email, please try again later`,
                });
        }
    }

    if (!response.data) {
        console.error(
            `[sendAdminPromotionEmail] Failed to send admin promotion email, no response data:`,
            response,
        );
        return err({
            type: "UNKNOWN_ERROR",
            message: `Failed to send admin promotion email, please try again later`,
        });
    }

    console.log(
        `[sendAdminPromotionEmail] Admin promotion email sent successfully: ${response.data?.id}`,
        {
            emailId: response.data?.id,
            recipient: user.email,
        },
    );

    return ok(response.data);
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
    template:
        | "verify"
        | "reset"
        | "change-email"
        | "delete-account"
        | "admin-promotion",
    props:
        | VerifyEmailProps
        | ResetPasswordProps
        | ChangeEmailVerificationProps
        | DeleteAccountConfirmationProps
        | AdminPromotionProps,
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
                DeleteAccountConfirmation(
                    props as DeleteAccountConfirmationProps,
                ),
            );
        case "admin-promotion":
            return await render(AdminPromotion(props as AdminPromotionProps));
        default:
            throw new Error(`Unknown email template: ${template as string}`);
    }
}
