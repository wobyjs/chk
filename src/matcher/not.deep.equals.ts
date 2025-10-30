/**
 * @file Implements the `not.deep.equals` (`!==`, `ndeq`) matchers for the `@woby/chk` testing framework.
 * These matchers assert that the subject is not strictly equal to the target value.
 */

import { Expect } from '../expect'
import { Match } from '../match'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is not strictly equal to the target (using `!==`).
         * This is an alias for `ndeq`.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        '!==': Match<T>
        /**
         * Asserts that the subject is not strictly equal to the target (using `!==`).
         * This matcher performs a strict inequality comparison, not a deep inequality comparison.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        ndeq: Match<T>
    }
}

// Extends the `Expect.prototype` to include the strict inequality matchers.
// Both `ndeq` and `!==` point to the same implementation.
Expect.prototype.ndeq =
    Expect.prototype['!=='] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        // Performs a strict inequality comparison.
        this.process('!==', subject !== target, subject as T, target)
        return this
    }

// Registers the strict inequality matchers with the console messenger for reporting.
messengers.ndeq = messengers['!=='] = [binary('!==')]