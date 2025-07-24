/**
 * @file Implements the `toMatch` matcher for the `verifies` testing framework.
 * This matcher asserts that a string matches a given regular expression.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject string matches the given regular expression.
         * @param regexp The regular expression (or string to be converted to a RegExp) to match against.
         * @returns The `Expect` instance for chaining.
         */
        toMatch(regexp: RegExp | string): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toMatch` matcher.
Expect.prototype.toMatch = function <T>(this: Expect<T>, regexp: RegExp | string) {
    const { subject } = this
    const text = String(subject)
    const regex = typeof regexp === 'string' ? new RegExp(regexp) : regexp
    const pass = regex.test(text)

    this.process('toMatch', pass, subject as T, regexp as T)
    return this
}

// Registers the `toMatch` matcher with the console messenger for reporting.
messengers.toMatch = [binary('toMatch')]