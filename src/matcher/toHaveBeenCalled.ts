/**
 * @file Implements the `toHaveBeenCalled` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that a mock function has been called at least once.
 */

import { Expect } from '../expect'
import { fn } from '../fn'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the mock function has been called at least once.
         * @template T The type of the mock function.
         * @returns The `Expect` instance for chaining.
         * @throws {Error} If the subject is not a mock function created with `fn()`.
         */
        toHaveBeenCalled<T extends ReturnType<typeof fn>>(): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toHaveBeenCalled` matcher.
Expect.prototype.toHaveBeenCalled = function <T extends ReturnType<typeof fn>>(this: Expect<T>) {
    const { subject } = this
    if (typeof subject !== 'function' || !subject.isMockFunction) {
        throw new Error('toHaveBeenCalled() can only be called on a mock function created with fn().')
    }

    const mockFn = subject //as ReturnType<typeof fn>;
    const result = mockFn.mock.calls.length > 0

    this.process('toHaveBeenCalled', this.result, subject, null as any)
    return this
}