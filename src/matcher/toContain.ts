/**
 * @file Implements the `toContain` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that an array or string contains a specific item or substring.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject (array or string) contains the specified item or substring.
         * For arrays, it checks for strict equality of elements.
         * For strings, it checks for substring inclusion.
         * @param item The item or substring expected to be contained in the subject.
         * @returns The `Expect` instance for chaining.
         */
        toContain(item: any): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toContain` matcher.
Expect.prototype.toContain = function <T>(this: Expect<T>, item: any) {
    const { subject } = this
    // Checks if the subject (assumed to be an array or string) includes the item.
    const pass = (subject as any[]).includes(item)

    this.process('toContain', pass, subject as T, item)
    return this
}

// Registers the `toContain` matcher with the console messenger for reporting.
messengers.toContain = [binary('toContain')]