/**
 * @file Implements the `toBeOneOf` matcher for the `chk` testing framework.
 * This matcher asserts that a value is one of the elements in a given array.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is one of the values in the provided array.
         * @param values An array of possible values that the subject is expected to be.
         * @returns The `Expect` instance for chaining.
         */
        toBeOneOf(values: any[]): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toBeOneOf` matcher.
Expect.prototype.toBeOneOf = function <T>(this: Expect<T>, values: any[]) {
    const { subject } = this
    const pass = values.includes(subject)

    this.process('toBeOneOf', pass, subject as T, values as T)
    return this
}

// Registers the `toBeOneOf` matcher with the console messenger for reporting.
messengers.toBeOneOf = [binary('toBeOneOf')]