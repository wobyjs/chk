/**
 * @file Implements strict equality matchers (`===`, `deq`, `toBe`) for the `verifies` testing framework.
 * These matchers assert that the subject is strictly equal to the target.
 */

import { Expect } from '../expect'
import { Match } from '../match'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is strictly equal to the target (using `===`).
         * This is an alias for `deq` and `toBe`.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        '===': Match<T>
        /**
         * Asserts that the subject is strictly equal to the target (using `===`).
         * This matcher performs a strict equality comparison, not a deep equality comparison.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        deq: Match<T>
        /**
         * Asserts that the subject is strictly equal to the target (using `===`).
         * This matcher performs a strict equality comparison, not a deep equality comparison.
         * This is an alias for `deq`.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        toBe: Match<T>
    }
}

// Extends the `Expect.prototype` to include the strict equality matchers.
// All three properties (`deq`, `toBe`, `===`) point to the same implementation.
Expect.prototype.deq =
    Expect.prototype.toBe =
    Expect.prototype['==='] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        // Performs a strict equality comparison.
        this.process('===', subject === target, subject as T, target)
        return this
    }

// Registers the strict equality matchers with the console messenger for reporting.
messengers.deq = messengers.toBe = messengers['==='] = [binary('===')]