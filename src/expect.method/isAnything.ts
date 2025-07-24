/**
 * @file Provides a utility function to check if a value is an `anything` matcher.
 */

import { ANYTHING_SYMBOL } from "../expect.static/anything"

/**
 * Checks if an object or an array of objects contains an `anything` matcher.
 * This is used to determine if a value should match anything during comparisons.
 * @template T The type of the object, which is expected to have the `ANYTHING_SYMBOL` property.
 * @param o The object or array of objects to check.
 * @returns `true` if the object or any element in the array is an `anything` matcher, `false` otherwise.
 */
export const isAnything = <T extends { [ANYTHING_SYMBOL]: true }>(o: any | T | T[]): o is T => Array.isArray(o) && o ? o.some(s => s?.[ANYTHING_SYMBOL]) : o?.[ANYTHING_SYMBOL]