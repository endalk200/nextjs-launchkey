import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Hr,
    Font,
} from "@react-email/components";
import type { ReactNode } from "react";

interface EmailLayoutProps {
    children: ReactNode;
    previewText: string;
}

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
    return (
        <Html>
            <Head>
                <Font
                    fontFamily="Inter"
                    fallbackFontFamily="Verdana"
                    webFont={{
                        url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
                        format: "woff2",
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
                <meta name="description" content={previewText} />
            </Head>
            <Body
                style={{
                    backgroundColor: "#fafbfe", // matches --background from globals.css
                    fontFamily: "Inter, system-ui, sans-serif",
                    margin: 0,
                    padding: 0,
                }}
            >
                <Container
                    style={{
                        maxWidth: "600px",
                        margin: "0 auto",
                        padding: "20px",
                    }}
                >
                    {/* Header */}
                    <Section
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            padding: "32px",
                            marginBottom: "24px",
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        <Text
                            style={{
                                fontSize: "24px",
                                fontWeight: "600",
                                color: "#6b46c1", // matches --primary from globals.css
                                margin: "0 0 8px 0",
                                textAlign: "center",
                            }}
                        >
                            NextCelerator
                        </Text>
                        <Text
                            style={{
                                fontSize: "14px",
                                color: "#6b7280",
                                margin: "0",
                                textAlign: "center",
                            }}
                        >
                            Accelerating your Next.js development
                        </Text>
                    </Section>

                    {/* Main Content */}
                    <Section
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            padding: "32px",
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        {children}
                    </Section>

                    {/* Footer */}
                    <Section
                        style={{
                            marginTop: "24px",
                            textAlign: "center",
                        }}
                    >
                        <Hr
                            style={{
                                borderColor: "#e5e7eb",
                                margin: "24px 0",
                            }}
                        />
                        <Text
                            style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                margin: "0 0 8px 0",
                            }}
                        >
                            This email was sent from NextCelerator
                        </Text>
                        <Text
                            style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                margin: "0",
                            }}
                        >
                            If you didn&apos;t request this email, you can
                            safely ignore it.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}
