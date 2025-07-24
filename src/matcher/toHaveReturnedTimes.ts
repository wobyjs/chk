/**
 * @file Implements the `toHaveReturnedTimes` matcher for the `verifies` testing framework.
 * This matcher asserts that a mock function has returned a value a specific number of times.
 */

import { Expect } from '../expect'
import { fn } from '../fn'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the mock function has returned a value exactly `expected` number of times.
         * @param expected The expected number of times the function should have returned.
         * @returns The `Expect` instance for chaining.
         * @throws {Error} If the subject is not a mock function created with `fn()`.
         */
        toHaveReturnedTimes(expected: number): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toHaveReturnedTimes` matcher.
Expect.prototype.toHaveReturnedTimes = function <T extends ReturnType<typeof fn>>(this: Expect<T>, expected: number) {
    const { subject } = this
    if (typeof subject !== 'function' || !subject.isMockFunction) {
        throw new Error('toHaveReturnedTimes() can only be called on a mock function created with fn().')
    }

    const mockFn = subject //as ReturnType<typeof fn>;
    const pass = mockFn.mock.results.filter((r: any) => r.type === 'return').length === expected

    this.process('toHaveReturnedTimes', pass, subject, expected as any)
    return this
}