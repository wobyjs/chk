/**
 * @file Implements the `toSatisfy` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that a value satisfies a given predicate function.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

/**
 * Checks if a subject value satisfies a given predicate function.
 * @param subject The value to check.
 * @param predicate The function that takes the subject and returns a boolean indicating satisfaction.
 * @returns `true` if the subject satisfies the predicate, `false` otherwise.
 */
export function toSatisfy(subject: any, predicate: (value: any) => boolean): boolean {
  return predicate(subject)
}

declare module '../expect' {
  interface Expect<T> {
    /**
     * Asserts that the subject value satisfies the given predicate function.
     * @param predicate A function that receives the subject and returns `true` if it satisfies the condition, `false` otherwise.
     * @returns The `Expect` instance for chaining.
     */
    toSatisfy: <T>(this: Expect<T>, predicate: (value: any) => boolean) => Expect<T>
  }
}

// Extends the `Expect.prototype` to include the `toSatisfy` matcher.
Expect.prototype.toSatisfy = function <T>(this: Expect<T>, predicate: (value: any) => boolean) {
  const { subject } = this
  const result = toSatisfy(subject, predicate)
  this.process('toSatisfy', result, subject as T, predicate as T)
  return this
}

// Registers the `toSatisfy` matcher with the console messenger for reporting.
messengers.toSatisfy = [binary('toSatisfy')]