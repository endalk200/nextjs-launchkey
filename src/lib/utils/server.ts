import "server-only";

// Re-export all Prisma error utilities for server-side use
export {
    isPrismaClientInitializationError,
    isPrismaClientRustPanicError,
    isPrismaValidationError,
    isPrismaForeignKeyConstraintError,
    isPrismaUniqueConstraintError,
    isPrismaNotFoundError,
    isPrismaKnownRequestError,
    isPrismaUnknownRequestError,
} from "./prisma-errors";
export { safeAwait, safeExecute } from "./safe-await";
