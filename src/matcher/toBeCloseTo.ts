/**
 * @file Implements the `toBeCloseTo` matcher for the `verifies` testing framework.
 * This matcher asserts that a number is close to another number within a specified precision.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject number is close to the expected number within a given precision.
         * This is useful for comparing floating-point numbers.
         * @param expected The expected number.
         * @param precision The number of decimal places to consider for precision (defaults to 2).
         * @returns The `Expect` instance for chaining.
         */
        toBeCloseTo(expected: number, precision?: number): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toBeCloseTo` matcher.
Expect.prototype.toBeCloseTo = function <T>(this: Expect<T>, expected: number, precision: number = 2) {
    const { subject } = this
    const received = typeof subject === 'number' ? subject : parseFloat(String(subject))

    const multiplier = Math.pow(10, precision)
    const pass = isNaN(received) || isNaN(expected) ? false : Math.round(received * multiplier) === Math.round(expected * multiplier)

    this.process('toBeCloseTo', pass, subject as T, expected as T)
    return this
}

// Registers the `toBeCloseTo` matcher with the console messenger for reporting.
messengers.toBeCloseTo = [binary('toBeCloseTo')]