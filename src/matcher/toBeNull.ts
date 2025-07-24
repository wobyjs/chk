/**
 * @file Implements the `toBeNull` matcher for the `verifies` testing framework.
 * This matcher asserts that a value is strictly `null`.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is strictly `null`.
         * @returns The `Expect` instance for chaining.
         */
        toBeNull(): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toBeNull` matcher.
Expect.prototype.toBeNull = function <T>(this: Expect<T>) {
    const { subject } = this
    const pass = subject === null

    this.process('toBeNull', pass, subject as T, null as T)
    return this
}

// Registers the `toBeNull` matcher with the console messenger for reporting.
messengers.toBeNull = [binary('toBeNull')]