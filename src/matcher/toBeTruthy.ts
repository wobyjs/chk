/**
 * @file Implements the `toBeTruthy` matcher for the `chk` testing framework.
 * This matcher asserts that a value is truthy (evaluates to `true` in a boolean context).
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is truthy.
         * Truthy values are values that evaluate to `true` when converted to a boolean.
         * @returns The `Expect` instance for chaining.
         */
        toBeTruthy(): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toBeTruthy` matcher.
Expect.prototype.toBeTruthy = function <T>(this: Expect<T>) {
    const { subject } = this
    const pass = !!subject

    this.process('toBeTruthy', pass, subject as T, undefined)
    return this
}

// Registers the `toBeTruthy` matcher with the console messenger for reporting.
messengers.toBeTruthy = [binary('toBeTruthy')]