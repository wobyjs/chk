/**
 * @file Implements the `toThrow` matcher for the `verifies` testing framework.
 * This matcher asserts that a function throws an error, optionally matching the error message or a regular expression.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject (which should be a function) throws an error.
         * Optionally, it can assert that the error message matches a specific string or regular expression.
         * @param expected Optional: A string or regular expression to match against the error message.
         */
        toThrow(expected?: string | RegExp): void
    }
}

// Extends the `Expect.prototype` to include the `toThrow` matcher.
Expect.prototype.toThrow = function <T>(this: Expect<T>, target: T) {
    this.process('toThrow', (this.subject as Error)?.message === target, this.subject as T, target)
}

// Registers the `toThrow` matcher with the console messenger for reporting.
messengers.toThrow = [binary('toThrow')]