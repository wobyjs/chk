/**
 * @file Implements the `greaterThan` (`>`) matcher for the `@woby/chk` testing framework.
 * This matcher asserts that the subject is greater than the target value.
 */

import { Expect } from '../expect'
import { Match } from '../match'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is greater than the target value.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        '>': Match<T>
        /**
         * Asserts that the subject is greater than the target value.
         * This is an alias for `>`.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        greaterThan: Match<T>
    }
}

// Extends the `Expect.prototype` to include the `greaterThan` matcher.
// Both `greaterThan` and `>` point to the same implementation.
Expect.prototype.greaterThan =
    Expect.prototype['>'] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        // Performs a greater than comparison.
        this.process('>', subject > target, subject as T, target)
        return this
    }

// Registers the `greaterThan` matcher with the console messenger for reporting.
messengers.greaterThan = messengers['>'] = [binary('>')]