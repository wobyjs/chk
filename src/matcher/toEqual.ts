/**
 * @file Implements the `toEqual` matcher for the `verifies` testing framework.
 * This matcher asserts that two values are deeply equal.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'
import { equals } from './equals'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is deeply equal to the expected value.
         * This matcher uses a recursive comparison to check all properties of objects and elements of arrays.
         * @param value The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        toEqual(value: any): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toEqual` matcher.
Expect.prototype.toEqual = function <T>(this: Expect<T>, value: any) {
    const { subject } = this
    const pass = equals(subject, value)

    this.process('toEqual', pass, subject as T, value)
    return this
}

// Registers the `toEqual` matcher with the console messenger for reporting.
messengers.toEqual = [binary('toEqual')]