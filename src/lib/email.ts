import { Resend } from "resend";
import { env } from "@/env";

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const from = `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_ADDRESS}>`;

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    react,
  });

  if (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }

  return data;
}
