/**
 * @file Implements the `toBeTypeOf` matcher for the `verifies` testing framework.
 * This matcher asserts that a value is of a specific JavaScript primitive type.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is of a specific JavaScript primitive type.
         * Uses the `typeof` operator for comparison.
         * @param type The expected primitive type (e.g., 'string', 'number', 'boolean', 'object', 'function', 'undefined', 'symbol', 'bigint').
         * @returns The `Expect` instance for chaining.
         */
        toBeTypeOf(type: 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined'): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toBeTypeOf` matcher.
Expect.prototype.toBeTypeOf = function <T>(this: Expect<T>, type: 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined') {
    const { subject } = this
    const pass = typeof subject === type

    this.process('toBeTypeOf', pass, subject as T, type as T)
    return this
}

// Registers the `toBeTypeOf` matcher with the console messenger for reporting.
messengers.toBeTypeOf = [binary('toBeTypeOf')]