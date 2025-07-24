/**
 * @file Implements the `toBeUndefined` matcher for the `verifies` testing framework.
 * This matcher asserts that a value is strictly `undefined`.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is strictly `undefined`.
         * @returns The `Expect` instance for chaining.
         */
        toBeUndefined(): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toBeUndefined` matcher.
Expect.prototype.toBeUndefined = function <T>(this: Expect<T>) {
    const { subject } = this
    const pass = subject === undefined

    this.process('toBeUndefined', pass, subject as T, undefined)
    return this
}

// Registers the `toBeUndefined` matcher with the console messenger for reporting.
messengers.toBeUndefined = [binary('toBeUndefined')]