/**
 * @file Implements the `toHaveBeenCalledNthCalledWith` matcher for the `verifies` testing framework.
 * This matcher asserts that a mock function was called with specific arguments on its Nth call.
 */

import { Expect } from '../expect'

import { fn } from '../fn'
import { equals } from './equals'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the mock function was called with the specified arguments on its Nth call.
         * @param nth The 1-based index of the call to check.
         * @param args The arguments that the mock function is expected to have been called with on the Nth call.
         * @returns The `Expect` instance for chaining.
         * @throws {Error} If the subject is not a mock function created with `fn()`.
         */
        toHaveBeenCalledNthCalledWith(nth: number, ...args: any[]): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toHaveBeenCalledNthCalledWith` matcher.
Expect.prototype.toHaveBeenCalledNthCalledWith = function <T extends ReturnType<typeof fn>>(this: Expect<T>, nth: number, ...args: any[]) {
    const { subject } = this
    if (typeof subject !== 'function' || !subject.isMockFunction) {
        throw new Error('toHaveBeenCalledNthCalledWith() can only be called on a mock function created with fn().')
    }

    const mockFn = subject //as ReturnType<typeof fn>;
    const call = mockFn.mock.calls[nth - 1] // nth is 1-indexed
    const pass = call ? equals(call, args) : false

    this.process('toHaveBeenCalledNthCalledWith', pass, subject as T, args as any)
    return this
}