import {
    PrismaClientKnownRequestError,
    PrismaClientUnknownRequestError,
    PrismaClientValidationError,
    PrismaClientInitializationError,
    PrismaClientRustPanicError,
} from "@prisma/client/runtime/library";

/**
 * Checks if an error is a Prisma "Record not found" error.
 *
 * This error occurs when trying to:
 * - Update a record that doesn't exist
 * - Delete a record that doesn't exist
 * - Access a record by unique identifier that doesn't exist
 *
 * Prisma Error Code: P2025
 *
 * @param error - The error to check
 * @returns True if the error is a Prisma not found error (P2025)
 *
 * @example
 * ```typescript
 * try {
 *   await prisma.user.delete({ where: { id: 'non-existent-id' } });
 * } catch (error) {
 *   if (isPrismaNotFoundError(error)) {
 *     // Handle record not found
 *   }
 * }
 * ```
 */
export function isPrismaNotFoundError(
    error: unknown,
): error is PrismaClientKnownRequestError {
    return (
        error instanceof PrismaClientKnownRequestError && error.code === "P2025"
    );
}

/**
 * Checks if an error is a Prisma unique constraint violation error.
 *
 * This error occurs when trying to:
 * - Create a record with a value that violates a unique constraint
 * - Update a record to have a value that conflicts with existing unique values
 * - Insert duplicate values in fields marked as unique or primary keys
 *
 * Prisma Error Code: P2002
 *
 * @param error - The error to check
 * @returns True if the error is a Prisma unique constraint error (P2002)
 *
 * @example
 * ```typescript
 * try {
 *   await prisma.user.create({ data: { email: 'existing@email.com' } });
 * } catch (error) {
 *   if (isPrismaUniqueConstraintError(error)) {
 *     // Handle duplicate email
 *   }
 * }
 * ```
 */
export function isPrismaUniqueConstraintError(
    error: unknown,
): error is PrismaClientKnownRequestError {
    return (
        error instanceof PrismaClientKnownRequestError && error.code === "P2002"
    );
}

/**
 * Checks if an error is a Prisma foreign key constraint violation error.
 *
 * This error occurs when trying to:
 * - Create a record that references a non-existent related record
 * - Update a foreign key to point to a non-existent record
 * - Delete a record that is referenced by other records (when cascade delete is not enabled)
 *
 * Prisma Error Code: P2003
 *
 * @param error - The error to check
 * @returns True if the error is a Prisma foreign key constraint error (P2003)
 *
 * @example
 * ```typescript
 * try {
 *   await prisma.post.create({ data: { title: 'Post', authorId: 'non-existent-user' } });
 * } catch (error) {
 *   if (isPrismaForeignKeyConstraintError(error)) {
 *     // Handle invalid foreign key reference
 *   }
 * }
 * ```
 */
export function isPrismaForeignKeyConstraintError(
    error: unknown,
): error is PrismaClientKnownRequestError {
    return (
        error instanceof PrismaClientKnownRequestError && error.code === "P2003"
    );
}

/**
 * Checks if an error is a Prisma validation error.
 *
 * This error occurs when:
 * - Query arguments are invalid or malformed
 * - Schema validation fails
 * - Type mismatches in query parameters
 * - Missing required fields in queries
 *
 * @param error - The error to check
 * @returns True if the error is a Prisma validation error
 *
 * @example
 * ```typescript
 * try {
 *   await prisma.user.findMany({ where: { invalidField: 'value' } });
 * } catch (error) {
 *   if (isPrismaValidationError(error)) {
 *     // Handle query validation error
 *   }
 * }
 * ```
 */
export function isPrismaValidationError(
    error: unknown,
): error is PrismaClientValidationError {
    return error instanceof PrismaClientValidationError;
}

/**
 * Checks if an error is a Prisma client initialization error.
 *
 * This error occurs when:
 * - Database connection cannot be established
 * - Invalid database URL or connection string
 * - Database server is unreachable
 * - Authentication issues with the database
 * - Schema synchronization problems
 *
 * @param error - The error to check
 * @returns True if the error is a Prisma client initialization error
 *
 * @example
 * ```typescript
 * try {
 *   const prisma = new PrismaClient();
 *   await prisma.$connect();
 * } catch (error) {
 *   if (isPrismaClientInitializationError(error)) {
 *     // Handle database connection issues
 *   }
 * }
 * ```
 */
export function isPrismaClientInitializationError(
    error: unknown,
): error is PrismaClientInitializationError {
    return error instanceof PrismaClientInitializationError;
}

/**
 * Checks if an error is a Prisma Rust panic error.
 *
 * This error occurs when:
 * - The underlying Prisma query engine (written in Rust) panics
 * - Internal engine errors or crashes
 * - Memory issues or system-level problems
 * - Critical engine failures
 *
 * Note: These are rare and typically indicate serious system issues.
 *
 * @param error - The error to check
 * @returns True if the error is a Prisma Rust panic error
 *
 * @example
 * ```typescript
 * try {
 *   await prisma.user.findMany();
 * } catch (error) {
 *   if (isPrismaClientRustPanicError(error)) {
 *     // Handle critical engine failure
 *   }
 * }
 * ```
 */
export function isPrismaClientRustPanicError(
    error: unknown,
): error is PrismaClientRustPanicError {
    return error instanceof PrismaClientRustPanicError;
}

/**
 * Checks if an error is a general Prisma known request error.
 *
 * This is a broader check that catches any known Prisma error with an error code.
 * Known request errors include:
 * - Database constraint violations (unique, foreign key, etc.)
 * - Record not found errors
 * - Query execution errors
 * - Any error with a specific Prisma error code (P-series codes)
 *
 * Use this when you want to handle any known Prisma error generically,
 * or when you need access to the error code for custom handling.
 *
 * @param error - The error to check
 * @returns True if the error is a Prisma known request error
 *
 * @example
 * ```typescript
 * try {
 *   await prisma.user.create(userData);
 * } catch (error) {
 *   if (isPrismaKnownRequestError(error)) {
 *     console.log(`Prisma error code: ${error.code}`);
 *     // Handle based on error.code
 *   }
 * }
 * ```
 */
export function isPrismaKnownRequestError(
    error: unknown,
): error is PrismaClientKnownRequestError {
    return error instanceof PrismaClientKnownRequestError;
}

/**
 * Checks if an error is a Prisma unknown request error.
 *
 * This error occurs when:
 * - An unexpected error happens during query execution
 * - Database returns an error that Prisma doesn't recognize
 * - Network issues during database communication
 * - Timeout errors
 * - Other unexpected database-related errors
 *
 * These errors don't have specific error codes and are harder to handle programmatically.
 *
 * @param error - The error to check
 * @returns True if the error is a Prisma unknown request error
 *
 * @example
 * ```typescript
 * try {
 *   await prisma.user.findMany();
 * } catch (error) {
 *   if (isPrismaUnknownRequestError(error)) {
 *     // Handle unexpected database error
 *   }
 * }
 * ```
 */
export function isPrismaUnknownRequestError(
    error: unknown,
): error is PrismaClientUnknownRequestError {
    return error instanceof PrismaClientUnknownRequestError;
}
