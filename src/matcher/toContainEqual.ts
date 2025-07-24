/**
 * @file Implements the `toContainEqual` matcher for the `verifies` testing framework.
 * This matcher asserts that an array contains an element that is deeply equal to a given item.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'
import { equals } from './equals'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject array contains an element that is deeply equal to the specified item.
         * This is useful for comparing objects or arrays within an array.
         * @param item The item expected to be deeply equal to one of the elements in the subject array.
         * @returns The `Expect` instance for chaining.
         */
        toContainEqual(item: any): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toContainEqual` matcher.
Expect.prototype.toContainEqual = function <T>(this: Expect<T>, item: any) {
    const { subject } = this
    // Checks if any element in the subject array is deeply equal to the item.
    const pass = (subject as any[]).some((element: any) => equals(element, item))

    this.process('toContainEqual', pass, subject as T, item)
    return this
}

// Registers the `toContainEqual` matcher with the console messenger for reporting.
messengers.toContainEqual = [binary('toContainEqual')]