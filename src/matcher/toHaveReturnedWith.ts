/**
 * @file Implements the `toHaveReturnedWith` matcher for the `chk` testing framework.
 * This matcher asserts that a mock function has returned a specific value at least once.
 */

import { Expect } from '../expect'
import { fn } from '../fn'
import { equals } from './equals'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the mock function has returned a value that is deeply equal to the specified arguments at least once.
         * @param args The arguments that the mock function is expected to have returned with.
         * @returns The `Expect` instance for chaining.
         * @throws {Error} If the subject is not a mock function created with `fn()`.
         */
        toHaveReturnedWith(...args: any[]): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toHaveReturnedWith` matcher.
Expect.prototype.toHaveReturnedWith = function <T extends ReturnType<typeof fn>>(this: Expect<T>, ...args: any[]) {
    const { subject } = this
    if (typeof subject !== 'function' || !subject.isMockFunction) {
        throw new Error('toHaveReturnedWith() can only be called on a mock function created with fn().')
    }

    const mockFn = subject //as ReturnType<typeof fn>;
    const pass = mockFn.mock.results.some((result: any) => {
        return result.type === 'return' && equals([result.value], args)
    })

    this.process('toHaveReturnedWith', pass, subject, args as any)
    return this
}