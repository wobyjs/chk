/**
 * @file Implements the `toBeNaN` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that a value is `NaN` (Not-a-Number).
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is `NaN` (Not-a-Number).
         * @returns The `Expect` instance for chaining.
         */
        toBeNaN(): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toBeNaN` matcher.
Expect.prototype.toBeNaN = function <T>(this: Expect<T>) {
    const { subject } = this
    const pass = isNaN(subject as any)

    this.process('toBeNaN', pass, subject as T, NaN as T)
    return this
}

// Registers the `toBeNaN` matcher with the console messenger for reporting.
messengers.toBeNaN = [binary('toBeNaN')]