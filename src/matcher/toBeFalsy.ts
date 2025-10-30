/**
 * @file Implements the `toBeFalsy` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that a value is falsy (evaluates to `false` in a boolean context).
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is falsy.
         * Falsy values include `false`, `0`, `-0`, `0n` (BigInt zero), `""` (empty string), `null`, `undefined`, and `NaN`.
         * @returns The `Expect` instance for chaining.
         */
        toBeFalsy(): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toBeFalsy` matcher.
Expect.prototype.toBeFalsy = function <T>(this: Expect<T>) {
    const { subject } = this
    const pass = !subject

    this.process('toBeFalsy', pass, subject as T, undefined)
    return this
}

// Registers the `toBeFalsy` matcher with the console messenger for reporting.
messengers.toBeFalsy = [binary('toBeFalsy')]