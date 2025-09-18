/**
 * @file Implements the `array.contains` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that an array contains all elements from another array.
 */

import { Expect } from '../expect'
import { Match } from '../match'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject array contains all elements present in the target array.
         * The order of elements does not matter.
         * @param target The array whose elements are expected to be present in the subject array.
         * @returns The `Expect` instance for chaining.
         */
        'array.contains': Match<T>
    }
}

// Extends the `Expect.prototype` to include the `array.contains` matcher.
Expect.prototype['array.contains'] = function <T extends []>(this: Expect<T>, target: T) {
    const { subject } = this
    // Checks if every element in the target array is included in the subject array.
    this.process('array.contains', target.every(i => (subject as T).includes(i)), subject as T, target)
    return this
}

// Note: There is no messenger registration for 'array.contains' in the original code.
// If reporting for this matcher is desired, a messenger should be added here.