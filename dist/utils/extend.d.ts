export declare const extend: <T extends Record<string, any>>(target: T, ...sources: T[]) => T;
/**
 * Performs a deep merge of option objects and returns new object. Does not modify
 * objects (immutable) and will ignore arrays.
 * @param objects - Objects to merge
 * @returns New object with merged key/values
 */
