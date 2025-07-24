/**
 * @file Implements the `toBeInstanceOf` matcher for the `verifies` testing framework.
 * This matcher asserts that a value is an instance of a specific class.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'
import { isFunction } from 'woby'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is an instance of the `expected` class.
         * @param expected The class constructor to check against.
         * @returns The `Expect` instance for chaining.
         */
        toBeInstanceOf(expected: any): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toBeInstanceOf` matcher.
Expect.prototype.toBeInstanceOf = function <T>(this: Expect<T>, expected: any) {
    const { subject } = this

    const pass = isFunction(expected) ? subject instanceof expected : false

    this.process('toBeInstanceOf', pass, subject as T, expected as T)
    return this
}

// Registers the `toBeInstanceOf` matcher with the console messenger for reporting.
messengers.toBeInstanceOf = [binary('toBeInstanceOf')]