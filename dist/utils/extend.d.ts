/**
 * Merge the contents of two or more objects together into the first object
 */
export declare const extend: <T extends Record<string, any>>(target: T, ...sources: T[]) => T;
