/**
 * @file Implements various numeric comparison matchers for the `chk` testing framework.
 * These matchers allow asserting relationships between numeric values, such as greater than, less than, and their inclusive counterparts.
 */

import { Expect } from '../expect'
import { Match } from '../match'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject is greater than the target value.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        '>': Match<T>
        /**
         * Asserts that the subject is greater than the target value.
         * This is an alias for `>`.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        greaterThan: Match<T>
        /**
         * Asserts that the subject is greater than the target value.
         * This is an alias for `>`.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        toBeGreaterThan: Match<T>
        /**
         * Asserts that the subject is greater than or equal to the target value.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        '>=': Match<T>
        /**
         * Asserts that the subject is greater than or equal to the target value.
         * This is an alias for `>=`.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        toBeGreaterThanOrEqual: Match<T>
        /**
         * Asserts that the subject is less than the target value.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        '<': Match<T>
        /**
         * Asserts that the subject is less than the target value.
         * This is an alias for `<`.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        lessThan: Match<T>
        /**
         * Asserts that the subject is less than the target value.
         * This is an alias for `<`.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        toBeLessThan: Match<T>
        /**
         * Asserts that the subject is less than or equal to the target value.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        '<=': Match<T>
        /**
         * Asserts that the subject is less than or equal to the target value.
         * This is an alias for `<=`.
         * @param target The value to compare against.
         * @returns The `Expect` instance for chaining.
         */
        toBeLessThanOrEqual: Match<T>
    }
}

// Extends the `Expect.prototype` to include the greater than matchers.
Expect.prototype.greaterThan =
    Expect.prototype['>'] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        this.process('>', subject > target, subject as T, target)
        return this
    }

// Extends the `Expect.prototype` to include the `toBeGreaterThan` matcher.
Expect.prototype.toBeGreaterThan =
    Expect.prototype['>'] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        this.process('>', subject > target, subject as T, target)
        return this
    }

// Extends the `Expect.prototype` to include the `toBeGreaterThanOrEqual` matcher.
Expect.prototype.toBeGreaterThanOrEqual =
    Expect.prototype['>='] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        this.process('>=', subject >= target, subject as T, target)
        return this
    }

// Extends the `Expect.prototype` to include the less than matchers.
Expect.prototype.lessThan =
    Expect.prototype['<'] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        this.process('<', subject < target, subject as T, target)
        return this
    }

// Extends the `Expect.prototype` to include the `toBeLessThan` matcher.
Expect.prototype.toBeLessThan =
    Expect.prototype['<'] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        this.process('<', subject < target, subject as T, target)
        return this
    }

// Extends the `Expect.prototype` to include the `toBeLessThanOrEqual` matcher.
Expect.prototype.toBeLessThanOrEqual =
    Expect.prototype['<='] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        this.process('<=', subject <= target, subject as T, target)
        return this
    }

// Registers the numeric comparison matchers with the console messenger for reporting.
messengers.greaterThan = messengers['>'] = [binary('>')]
messengers.toBeGreaterThan = messengers['>']
messengers.toBeGreaterThanOrEqual = messengers['>='] = [binary('>=')]
messengers.lessThan = messengers['<'] = [binary('<')]
messengers.toBeLessThan = messengers['<']
messengers.toBeLessThanOrEqual = messengers['<='] = [binary('<=')]