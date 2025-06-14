export type PlainObject = {
    [name: string]: any;
};
export type PlainObjectOf<T> = {
    [name: string]: T;
};
export declare const isPlainObject: (obj: any) => obj is PlainObject;
