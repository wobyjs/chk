/**
 * @file Implements the `toHaveBeenCalledTimes` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that a mock function has been called a specific number of times.
 */

import { Expect } from '../expect'
import { fn } from '../fn'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the mock function has been called exactly `expected` number of times.
         * @param expected The expected number of calls.
         * @returns The `Expect` instance for chaining.
         * @throws {Error} If the subject is not a mock function created with `fn()`.
         */
        toHaveBeenCalledTimes(expected: number): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toHaveBeenCalledTimes` matcher.
Expect.prototype.toHaveBeenCalledTimes = function <T extends ReturnType<typeof fn>>(this: Expect<T>, expected: number) {
    const { subject } = this
    if (typeof subject !== 'function' || !subject.isMockFunction) {
        throw new Error('toHaveBeenCalledTimes() can only be called on a mock function created with fn().')
    }

    const mockFn = subject //as ReturnType<typeof fn>;
    const pass = mockFn.mock.calls.length === expected

    this.process('toHaveBeenCalledTimes', pass, subject as T, expected as any)
    return this
}