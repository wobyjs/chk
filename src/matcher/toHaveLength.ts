/**
 * @file Implements the `toHaveLength` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that an object (e.g., array, string) has a specific `length` property.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject has a `length` property equal to the expected value.
         * This is typically used for arrays and strings.
         * @param expected The expected length.
         * @returns The `Expect` instance for chaining.
         */
        toHaveLength(expected: number): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toHaveLength` matcher.
Expect.prototype.toHaveLength = function <T>(this: Expect<T>, expected: number) {
    const { subject } = this
    const pass = (subject as any).length === expected

    this.process('toHaveLength', pass, subject as T, expected as T)
    return this
}

// Registers the `toHaveLength` matcher with the console messenger for reporting.
messengers.toHaveLength = [binary('toHaveLength')]