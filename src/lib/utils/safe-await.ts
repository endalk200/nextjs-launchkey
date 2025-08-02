/**
 * Executes a promise and returns a tuple with the result and an error if it occurs.
 * @param promise - The promise to execute.
 * @returns A tuple with the result and an error if it occurs.
 */
export async function safeAwait<T, E = Error>(
    promise: Promise<T>,
): Promise<[T, null] | [null, E]> {
    try {
        const result = await promise;
        return [result, null];
    } catch (error) {
        return [null, error as E];
    }
}

/**
 * Executes a function and returns a tuple with the result and an error if it occurs.
 * @param fn - The function to execute.
 * @returns A tuple with the result and an error if it occurs.
 */
export function safeExecute<T, E = Error>(fn: () => T): [T, null] | [null, E] {
    try {
        const result = fn();
        return [result, null];
    } catch (error) {
        return [null, error as E];
    }
}
