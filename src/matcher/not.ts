/**
 * @file Implements the `not` modifier for the `verifies` testing framework.
 * This allows for inverting the result of any subsequent matcher, enabling assertions for negative conditions.
 */

import { Expect } from '../expect'
import { isAnything } from '../expect.method'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Inverts the result of the next matcher in the chain.
         * For example, `expect(value).not.toBe(expected)` asserts that `value` is not strictly equal to `expected`.
         * @returns The `Expect` instance with the `_not` flag toggled.
         */
        not: Expect<T>
        /**
         * Internal flag to track whether the `not` modifier has been applied.
         * @internal
         */
        _not: boolean
    }
}

// Defines a getter for the `not` property on the `Expect` prototype.
// When `expect.not` is accessed, it toggles the internal `_not` flag.
Object.defineProperty(Expect.prototype, 'not', {
    get: function <T>(this: Expect<T>) {
        this._not = !this._not
        return this
    }
})

// Stores a reference to the original `process` method.
const originalProcess = Expect.prototype.process

/**
 * Overrides the `process` method of `Expect` to apply the `not` logic.
 * If the `_not` flag is set, the `result` of the matcher is inverted.
 * It also prepends a '!' to the `key` for visual indication in reports.
 * @param key The identifier of the matcher.
 * @param result The boolean result of the matcher before `not` is applied.
 * @param subject The subject of the expectation.
 * @param target The target of the expectation.
 */
Expect.prototype.process = function (key: string, result: boolean, subject: any, target: any) {
    originalProcess.call(this, (this._not ? '\x1b[33m!\x1b[0m' : '') + key, this._not || isAnything(target) ? !result : result, subject, target)
}