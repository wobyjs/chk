/**
 * @file Implements the `rejects` matcher for the `chk` testing framework.
 * This matcher is used to assert that a Promise subject rejects, and optionally, to assert the value it rejects with.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'
import { Unpromise } from '../types'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the Promise subject rejects.
         * This property unwraps the Promise and sets the subject to the rejected value (error).
         * Subsequent matchers will then operate on the rejected value.
         * @returns A new `Expect` instance with the subject set to the rejected value.
         */
        rejects: Expect<Unpromise<T>>
        /**
         * Internal flag indicating whether the Promise subject has rejected.
         * @internal
         */
        rejected: boolean
    }
}

// Defines a getter for the `rejects` property on the `Expect` prototype.
// When `expect(promise).rejects` is accessed, it awaits the promise.
// If the promise rejects, it sets the `rejected` flag and updates the subject to the rejected value.
Object.defineProperty(Expect.prototype, 'rejects', {
    get: async function <T>(this: Expect<T>) {
        try {
            this.subject = await this.subject
        } catch (e) {
            this.rejected = true
            //@ts-ignore
            this.subject = e
        }
        // this.process('rejects', rejected, this.subject as any, 'to reject')
        return this as Expect<Unpromise<T>>
    }
})

// Registers the `rejects` matcher with the console messenger for reporting.
messengers.rejects = [binary('rejects')]