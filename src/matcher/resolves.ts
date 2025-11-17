/**
 * @file Implements the `resolves` matcher for the `@woby/chk` testing framework.
 * This matcher is used to assert that a Promise subject resolves, and optionally, to assert the value it resolves with.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'
import { isPromise } from 'woby'
import { Unpromise } from '../types'
// import sp from 'synchronized-promise'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the Promise subject resolves.
         * This property unwraps the Promise and sets the subject to the resolved value.
         * Subsequent matchers will then operate on the resolved value.
         * @returns A new `Expect` instance with the subject set to the resolved value.
         */
        resolves: Expect<Unpromise<T>>
        /**
         * Internal flag indicating whether the Promise subject has resolved.
         * @internal
         */
        resolved: boolean
    }
}

// Defines a getter for the `resolves` property on the `Expect` prototype.
// When `expect(promise).resolves` is accessed, it returns the same Expect instance
// but marks it as needing resolution.
Object.defineProperty(Expect.prototype, 'resolves', {
    get: async function <T>(this: Expect<T>) {
        // Mark this expectation as needing resolution
        this.resolved = false

        try {
            if (isPromise(this.subject)) this.subject = await this.subject
            this.resolved = true
        } catch (e) {
            // Do nothing, it rejected
        }

        return this as Expect<Unpromise<T>>
    }
})

// Registers the `resolves` matcher with the console messenger for reporting.
messengers.resolves = [binary('resolves')]