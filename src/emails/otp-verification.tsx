import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OTPVerificationEmailProps {
  otp: string;
  type: "sign-in" | "email-verification";
}

export function OTPVerificationEmail({ otp, type }: OTPVerificationEmailProps) {
  const title =
    type === "email-verification"
      ? "Verify your email address"
      : "Sign in to your account";

  const description =
    type === "email-verification"
      ? "Use the code below to verify your email address and complete your registration."
      : "Use the code below to sign in to your account.";

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <div style={logoContainer}>
              <span style={logoText}>A</span>
            </div>
            <Text style={brandName}>Your App</Text>
          </Section>

          <Heading style={heading}>{title}</Heading>

          <Text style={paragraph}>{description}</Text>

          <Section style={codeSection}>
            <Text style={code}>{otp}</Text>
          </Section>

          <Text style={paragraph}>
            This code will expire in 5 minutes. If you didn&apos;t request this
            code, you can safely ignore this email.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Your App — A modern full-stack starter template
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OTPVerificationEmail;

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "480px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logoContainer = {
  display: "inline-block",
  backgroundColor: "#3b82f6",
  color: "#ffffff",
  width: "48px",
  height: "48px",
  borderRadius: "8px",
  textAlign: "center" as const,
  lineHeight: "48px",
  fontSize: "18px",
  fontWeight: "600",
};

const logoText = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
};

const brandName = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#333333",
  marginTop: "12px",
  marginBottom: "0",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#333333",
  textAlign: "center" as const,
  marginBottom: "16px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#4b5563",
  textAlign: "center" as const,
};

const codeSection = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const code = {
  fontSize: "32px",
  fontWeight: "700",
  color: "#3b82f6",
  letterSpacing: "8px",
  margin: "0",
  fontFamily: "monospace",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0",
};

const footer = {
  fontSize: "12px",
  color: "#6b7280",
  textAlign: "center" as const,
};
