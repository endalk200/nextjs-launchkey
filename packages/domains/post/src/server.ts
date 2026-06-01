/**
 * Server-only entry point for wiring the post domain into an application RPC
 * server.
 */
export { PostRepoPrismaLive } from "./server/prisma-repo.ts";
export { PostHandlers, PostRpcs } from "./server/rpc.ts";
export { PostOperationsLive } from "./server/service.ts";
