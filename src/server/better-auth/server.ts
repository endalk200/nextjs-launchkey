import { auth, type Session } from ".";
import { headers } from "next/headers";
import { cache } from "react";

export const getSession = cache(async (): Promise<Session | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session as Session | null;
});
