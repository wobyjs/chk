/**
 * @file Implements the `toHaveReturned` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that a mock function has returned a value at least once.
 */

import { Expect } from '../expect'
import { fn } from '../fn'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the mock function has returned a value at least once.
         * @template T The type of the mock function.
         * @returns The `Expect` instance for chaining.
         * @throws {Error} If the subject is not a mock function created with `fn()`.
         */
        toHaveReturned(): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toHaveReturned` matcher.
Expect.prototype.toHaveReturned = function <T extends ReturnType<typeof fn>>(this: Expect<T>) {
    const { subject } = this
    if (typeof subject !== 'function' || !subject.isMockFunction) {
        throw new Error('toHaveReturned() can only be called on a mock function created with fn().')
    }

    const mockFn = subject //as ReturnType<typeof fn>;
    const pass = mockFn.mock.results.some((r: any) => r.type === 'return')

    this.process('toHaveReturned', pass, subject, null as any)
    return this
}