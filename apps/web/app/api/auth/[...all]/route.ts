import { getAuthRouteHandlers } from "@app/auth/server";

export const runtime = "nodejs";

export const { DELETE, GET, PATCH, POST, PUT } = getAuthRouteHandlers();
