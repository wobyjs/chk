/**
 * @file Implements the `not.equals` (`!=`, `neq`) matchers for the `verifies` testing framework.
 * These matchers assert that the subject is not loosely equal to the target value.
 */

import { Expect } from '../expect'
import { Match } from '../match'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is not loosely equal to the target (using `!=`).
         * This is an alias for `neq`.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        '!=': Match<T>
        /**
         * Asserts that the subject is not loosely equal to the target (using `!=`).
         * This matcher performs a loose inequality comparison.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        neq: Match<T>
    }
}

// Extends the `Expect.prototype` to include the loose inequality matchers.
// Both `neq` and `!=` point to the same implementation.
Expect.prototype.neq =
    Expect.prototype['!='] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        // Performs a loose inequality comparison.
        this.process('!=', subject != target, subject as T, target)
        return this
    }

// Registers the loose inequality matchers with the console messenger for reporting.
messengers.neq = messengers['!='] = [binary('!=')]