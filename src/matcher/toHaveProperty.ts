/**
 * @file Implements the `toHaveProperty` matcher for the `verifies` testing framework.
 * This matcher asserts that an object has a specific property, optionally with a specific value.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the subject object has a specific property, optionally with a specific value.
         * @param property The name of the property to check for.
         * @param value Optional: The expected value of the property. If provided, the matcher also asserts that the property's value is strictly equal to this value.
         * @returns The `Expect` instance for chaining.
         */
        toHaveProperty(property: string, value?: any): Expect<T>
    }
}

// Extends the `Expect.prototype` to include the `toHaveProperty` matcher.
Expect.prototype.toHaveProperty = function <T>(this: Expect<T>, property: string, value?: any) {
    const { subject } = this
    const hasProperty = Object.prototype.hasOwnProperty.call(subject, property)
    let pass = hasProperty
    let message = ''

    if (hasProperty && value !== undefined) {
        pass = (subject as any)[property] === value
    }

    if (pass) {
        message = `Expected subject not to have property ${property}`
        if (value !== undefined) {
            message += ` with value ${value}, but it did.`
        }
    } else {
        message = `Expected subject to have property ${property}`
        if (value !== undefined) {
            message += ` with value ${value}, but it did not.`
        }
    }

    this.process('toHaveProperty', pass, subject as T, property as T)
    return this
}

// Registers the `toHaveProperty` matcher with the console messenger for reporting.
messengers.toHaveProperty = [binary('toHaveProperty')]