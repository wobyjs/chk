/**
 * @file Implements the `equals` function for deep equality comparison and the `eq` (`==`) matcher for the `verifies` testing framework.
 * This provides a way to assert that two values are deeply equal, handling various data types including objects and arrays.
 */

import { Expect } from '../expect'
import { Match } from '../match'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'
import { isAny, matchAny } from '../expect.method/isAny'

/**
 * Performs a deep equality comparison between two values.
 * It handles primitive types, arrays, and objects recursively.
 * Special handling for `expect.any()` matchers is included.
 * 
 * @param a The first value to compare.
 * @param b The second value to compare.
 * @returns `true` if the values are deeply equal, `false` otherwise.
 */
export function equals(a: any, b: any) {
    if (isAny(b)) return matchAny(a, b)

    if (a === b) return true

    if (a == null || typeof a != "object" ||
        b == null || typeof b != "object") {
        return false
    }

    if (a.constructor !== b.constructor) return false

    if (Array.isArray(a)) {
        if (a.length !== b.length) return false
        for (let i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) return false
        }
        return true
    }

    if (a instanceof Object) {
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)

        if (keysA.length !== keysB.length) return false

        for (const key of keysA) {
            if (!keysB.includes(key) || !equals(a[key], b[key])) {
                return false
            }
        }
        return true
    }

    return false
}

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is deeply equal to the target.
         * This matcher uses the `equals` function for comparison.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        '==': Match<T>
        /**
         * Asserts that the subject is deeply equal to the target.
         * This is an alias for `==`.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        eq: Match<T>
    }
}

// Extends the `Expect.prototype` to include the deep equality matchers.
// Both `eq` and `==` point to the same implementation.
Expect.prototype.eq =
    Expect.prototype['=='] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        const result = equals(subject, target)
        this.process('==', result, subject as T, target)
        return this
    }

// Registers the deep equality matchers with the console messenger for reporting.
messengers.eq = messengers['=='] = [binary('==')]