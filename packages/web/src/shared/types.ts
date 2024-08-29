/**
 * Defines a member that can have a value or be null
 */
export type Nullable<T> = T | null;

/**
 * Defines a member that can have a value or be undefined
 */
export type Undefinable<T> = T | undefined;

/**
 * Defines a string dictionary
 */
export interface StringDictionary<T> {
    [key: string]: T;
}

/**
 * Defines a number dictionary
 */
export interface NumberDictionary<T> {
    [key: number]: T;
}