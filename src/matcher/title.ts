/**
 * @file Implements the `setTitle` (`$`) matcher for the `verifies` testing framework.
 * This matcher allows setting a custom title or description for an expectation, which can be useful for reporting.
 */

import { Expect } from '../expect'
import { Match } from '../match'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Sets a custom title or description for the current expectation.
         * This title will be used in test reports to provide more context for the assertion.
         * @param title The string to set as the title for this expectation.
         * @returns The `Expect` instance for chaining.
         */
        '$': Match<string>
        /**
         * Sets a custom title or description for the current expectation.
         * This is an alias for `$`.
         * @param title The string to set as the title for this expectation.
         * @returns The `Expect` instance for chaining.
         */
        setTitle: Match<string>
    }
}

// Extends the `Expect.prototype` to include the `setTitle` matcher.
// Both `setTitle` and `$` point to the same implementation.
Expect.prototype.setTitle =
    Expect.prototype.$ = function <T>(this: Expect<T>, target: string) {
        const { subject } = this
        // Assigns the provided string as the title of the current expectation.
        this.title = target
        return this
    }