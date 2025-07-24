/**
 * @file Implements the `toHaveBeenCalledWith` matcher for the `verifies` testing framework.
 * This matcher asserts that a mock function has been called with specific arguments at least once.
 */

import { Expect } from '../expect'
import { fn } from '../fn'
import { equals } from './equals'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the mock function has been called with the specified arguments at least once.
         * The arguments are compared using deep equality.
         * @param args The arguments that the mock function is expected to have been called with.
         * @returns The `Expect` instance for chaining.
         * @throws {Error} If the subject is not a mock function created with `fn()`.
         */
        toHaveBeenCalledWith(...args: any[]): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toHaveBeenCalledWith` matcher.
Expect.prototype.toHaveBeenCalledWith = function <T extends ReturnType<typeof fn>>(this: Expect<T>, ...args: any[]) {
    const { subject } = this
    if (typeof subject !== 'function' || !subject.isMockFunction) {
        throw new Error('toHaveBeenCalledWith() can only be called on a mock function created with fn().')
    }

    const mockFn = subject //as ReturnType<typeof fn>;
    const pass = mockFn.mock.calls.some((callArgs: any[]) => {
        return equals(callArgs, args)
    })

    this.process('toHaveBeenCalledWith', pass, subject, args as any)
    return this
}