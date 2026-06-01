/**
 * Server-only entry point for wiring the post domain into an application RPC
 * server.
 */
export { PostRepoPrismaLive } from "./server/post.repository.ts";
export { PostRpcs } from "./server/rpc.defnition.ts";
export { PostHandlers } from "./server/rpc.handler.ts";
export { PostOperationsLive } from "./server/service.ts";
