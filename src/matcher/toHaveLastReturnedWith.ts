/**
 * @file Implements the `toHaveLastReturnedWith` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that a mock function's last successful return value matches a given expected value.
 */

import { Expect } from '../expect'
import { fn } from '../fn'
import { equals } from './equals'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the mock function's last successful return value matches the specified value.
         * @param value The value that the mock function is expected to have last returned.
         * @returns The `Expect` instance for chaining.
         * @throws {Error} If the subject is not a mock function created with `fn()`.
         */
        toHaveLastReturnedWith<T>(value: any): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toHaveLastReturnedWith` matcher.
Expect.prototype.toHaveLastReturnedWith = function <T extends ReturnType<typeof fn>>(this: Expect<T>, value: T) {
    const { subject } = this
    if (typeof subject !== 'function' || !subject.isMockFunction) {
        throw new Error('toHaveLastReturnedWith() can only be called on a mock function created with fn().')
    }

    const mockFn = subject //as ReturnType<typeof fn>;
    const lastReturn = mockFn.mock.results.filter((r: any) => r.type === 'return').pop()
    const pass = lastReturn ? equals(lastReturn.value, value) : false

    this.process('toHaveLastReturnedWith', pass, subject as T, value)
    return this
}