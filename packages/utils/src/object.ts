/**
 * Object utility functions
 */

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if an object is empty
 * @param obj - Object to check
 * @returns True if object is empty
 */
export function isEmpty(obj: Record<string, any>): boolean {
    return Object.keys(obj).length === 0;
}

/**
 * Pick specific keys from an object
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns New object with picked keys
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}

/**
 * Omit specific keys from an object
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns New object without omitted keys
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => {
        delete result[key];
    });
    return result as Omit<T, K>;
}

/**
 * Merge multiple objects
 * @param objects - Objects to merge
 * @returns Merged object
 */
export function merge<T extends Record<string, any>>(
    ...objects: Partial<T>[]
): T {
    return Object.assign({}, ...objects) as T;
}
