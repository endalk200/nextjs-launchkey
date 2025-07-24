import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === "production" ? "" : "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
