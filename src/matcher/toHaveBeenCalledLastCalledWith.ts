/**
 * @file Implements the `toHaveBeenCalledLastCalledWith` matcher for the `chk` testing framework.
 * This matcher asserts that a mock function was last called with specific arguments.
 */

import { Expect } from '../expect'

import { fn } from '../fn'
import { equals } from './equals'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the mock function was last called with the specified arguments.
         * @param args The arguments that the mock function is expected to have been last called with.
         * @returns The `Expect` instance for chaining.
         * @throws {Error} If the subject is not a mock function created with `fn()`.
         */
        toHaveBeenCalledLastCalledWith(...args: any[]): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toHaveBeenCalledLastCalledWith` matcher.
Expect.prototype.toHaveBeenCalledLastCalledWith = function <T extends ReturnType<typeof fn>>(this: Expect<T>, ...args: any[]) {
    const { subject } = this
    if (typeof subject !== 'function' || !subject.isMockFunction) {
        throw new Error('toHaveBeenCalledLastCalledWith() can only be called on a mock function created with fn().')
    }

    const mockFn = subject //as ReturnType<typeof fn>;
    const lastCall = mockFn.mock.calls[mockFn.mock.calls.length - 1]
    const pass = lastCall ? equals(lastCall, args) : false

    this.process('toHaveBeenCalledLastCalledWith', pass, subject as T, args as any)
    return this
}