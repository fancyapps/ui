export type PlainObject = {
    [name: string]: any;
};
export type PlainObjectOf<T> = {
    [name: string]: T;
};
/**
 * Check if the given object is a plain object
 */
export declare const isPlainObject: (obj: unknown) => obj is PlainObject;
