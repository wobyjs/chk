/**
 * @file Implements the `toMatchObject` matcher for the `chk` testing framework.
 * This matcher asserts that an object contains a subset of properties and values from another object.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject object matches a subset of properties and values from the expected object.
         * This performs a recursive check, ensuring that all properties present in the `object` argument
         * are also present in the `subject` and have matching values.
         * @param object The object containing the expected subset of properties and values.
         * @returns The `Expect` instance for chaining.
         */
        toMatchObject(object: object): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toMatchObject` matcher.
Expect.prototype.toMatchObject = function <T>(this: Expect<T>, object: object) {
    const { subject } = this

    /**
     * Recursively checks if `received` object matches `expected` object (subset).
     * @param received The object being checked.
     * @param expected The object containing the expected properties.
     * @returns `true` if `received` matches `expected`, `false` otherwise.
     */
    const checkMatch = (received: any, expected: any): boolean => {
        // if (isAnything(expected)) return received !== null && received !== undefined
        if (received === expected) return true

        if (typeof received !== 'object' || received === null ||
            typeof expected !== 'object' || expected === null) {
            return false
        }

        for (const key in expected) {
            if (!Object.prototype.hasOwnProperty.call(received, key)) {
                return false
            }
            if (!checkMatch(received[key], expected[key])) {
                return false
            }
        }
        return true
    }

    const pass = checkMatch(subject, object)

    this.process('toMatchObject', pass, subject as T, object as T)
    return this
}

// Registers the `toMatchObject` matcher with the console messenger for reporting.
messengers.toMatchObject = [binary('toMatchObject')]