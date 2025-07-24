/**
 * @file Provides utility functions for checking if a value matches the `any` or `anything` special matchers,
 * and for performing type-based matching against expected constructors.
 */

import { ANY_SYMBOL } from "../expect.static/any"

/**
 * Checks if an object is an `any` matcher.
 * @param o The object to check.
 * @returns `true` if the object is an `any` matcher, `false` otherwise.
 */
export const isAny = (o: any): boolean => o && o[ANY_SYMBOL]

/**
 * Matches a received value against an expected constructor or type.
 * This function is used internally by matchers like `toEqual` when `expect.any()` or `expect.anything()` is used.
 * @param received The value received in the test.
 * @param expected The expected value, which might be a special matcher object (e.g., `expect.any(String)`).
 * @returns `true` if the received value matches the expected type or constructor, `false` otherwise.
 */
export const matchAny = (received: any, expected: any): boolean => {
    if (expected.expectedConstructor === String) {
        return typeof received === 'string'
    } else if (expected.expectedConstructor === Number) {
        return typeof received === 'number'
    } else if (expected.expectedConstructor === Boolean) {
        return typeof received === 'boolean'
    } else if (expected.expectedConstructor === Function) {
        return typeof received === 'function'
    } else if (expected.expectedConstructor === Object) {
        return typeof received === 'object' && received !== null
    } else if (expected.expectedConstructor === Array) {
        return Array.isArray(received)
    } else if (expected.expectedConstructor === Symbol) {
        return typeof received === 'symbol'
    } else if (expected.expectedConstructor === BigInt) {
        return typeof received === 'bigint'
    } else if (expected.expectedConstructor === undefined) {
        return received === undefined
    } else if (expected.expectedConstructor === null) {
        return received === null
    } else {
        if (typeof expected.expectedConstructor === 'function') {
            return received instanceof expected.expectedConstructor
        } else {
            return false
        }
    }
}