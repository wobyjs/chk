/**
 * @file Implements the `toBeDefined` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that a value is not `undefined`.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is not `undefined`.
         * @returns The `Expect` instance for chaining.
         */
        toBeDefined(): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toBeDefined` matcher.
Expect.prototype.toBeDefined = function <T>(this: Expect<T>) {
    const { subject } = this
    const pass = subject !== undefined

    this.process('toBeDefined', pass, subject as T, undefined as T)
    return this
}

// Registers the `toBeDefined` matcher with the console messenger for reporting.
messengers.toBeDefined = [binary('toBeDefined')]