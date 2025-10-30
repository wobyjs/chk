/**
 * @file Implements the `toThrow` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that a function throws an error, optionally matching the error message or a regular expression.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject (which should be a function) throws an error
         * and that the error message contains the specified substring.
         * @param expected A string that should be contained in the error message.
         */
        toThrowErrorContains(expected: string): void
    }
}


// Extends the `Expect.prototype` to include the `toThrowErrorContains` matcher.
Expect.prototype.toThrowErrorContains = function <T>(this: Expect<T>, target: string) {
    const errorMessage = (this.subject as Error)?.message
    const pass = typeof errorMessage === 'string' && errorMessage.includes(target)
    this.process('toThrowErrorContains', pass, this.subject as T, target as any)
}

// Registers the `toThrowErrorContains` matcher with the console messenger for reporting.
messengers.toThrowErrorContains = [binary('toThrowErrorContains')]