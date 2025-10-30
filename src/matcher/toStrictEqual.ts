/**
 * @file Implements the `toStrictEqual` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that two values are deeply and strictly equal, including their types and object structures.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is deeply and strictly equal to the expected value.
         * This matcher performs a recursive comparison, checking for equality of values, types, and object structures.
         * @param value The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        toStrictEqual(value: any): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toStrictEqual` matcher.
Expect.prototype.toStrictEqual = function <T>(this: Expect<T>, value: any) {
    const { subject } = this

    /**
     * Recursively checks for strict equality between two values.
     * @param a The first value to compare.
     * @param b The second value to compare.
     * @returns `true` if the values are strictly equal, `false` otherwise.
     */
    const checkStrictEqual = (a: any, b: any): boolean => {
        // if (isAnything(b)) return a !== null && a !== undefined
        if (a === b) return true

        if (a == null || typeof a != "object" ||
            b == null || typeof b != "object") {
            return false
        }

        if (a.constructor !== b.constructor) return false

        if (Array.isArray(a)) {
            if (a.length !== b.length) return false
            for (let i = 0; i < a.length; i++) {
                if (!checkStrictEqual(a[i], b[i])) return false
            }
            return true
        }

        if (a instanceof Object) {
            const keysA = Object.keys(a)
            const keysB = Object.keys(b)

            if (keysA.length !== keysB.length) return false

            for (const key of keysA) {
                if (!Object.prototype.hasOwnProperty.call(b, key) || !checkStrictEqual(a[key], b[key])) {
                    return false
                }
            }
            return true
        }

        return false
    }

    const pass = checkStrictEqual(subject, value)

    this.process('toStrictEqual', pass, subject as T, value)
    return this
}

// Registers the `toStrictEqual` matcher with the console messenger for reporting.
messengers.toStrictEqual = [binary('toStrictEqual')]