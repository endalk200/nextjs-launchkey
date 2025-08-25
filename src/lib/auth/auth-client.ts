import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL:
        process.env.NODE_ENV === "production" ? "" : "http://localhost:3000",
    plugins: [adminClient()],
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    forgetPassword,
    resetPassword,
    sendVerificationEmail,
    changeEmail,
    changePassword,
    updateUser,
    deleteUser,
    listSessions,
    revokeSession,
    getSession,
    linkSocial,
    unlinkAccount,
    admin,
} = authClient;

export type Session = typeof authClient.$Infer.Session;
