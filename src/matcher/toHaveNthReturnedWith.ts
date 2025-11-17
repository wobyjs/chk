/**
 * @file Implements the `toHaveNthReturnedWith` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that a mock function's Nth successful return value matches a given expected value.
 */

import { Expect } from '../expect'
import { fn } from '../fn'
import { equals } from './equals'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the mock function's Nth successful return value matches the specified value.
         * @param nth The 1-based index of the return value to check.
         * @param value The value that the mock function is expected to have returned on the Nth call.
         * @returns The `Expect` instance for chaining.
         * @throws {Error} If the subject is not a mock function created with `fn()`.
         */
        toHaveNthReturnedWith(nth: number, value: any): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toHaveNthReturnedWith` matcher.
Expect.prototype.toHaveNthReturnedWith = function <T extends ReturnType<typeof fn>>(this: Expect<T>, nth: number, value: any) {
    const { subject } = this
    if (typeof subject !== 'function' || !subject.isMockFunction) {
        throw new Error('toHaveNthReturnedWith() can only be called on a mock function created with fn().')
    }

    const mockFn = subject //as ReturnType<typeof fn>;
    const returnResult = mockFn.mock.results.filter((r: any) => r.type === 'return')[nth - 1] // nth is 1-indexed
    const pass = returnResult ? equals(returnResult.value, value) : false

    this.process('toHaveNthReturnedWith', pass, subject as T, value)
    return this
}