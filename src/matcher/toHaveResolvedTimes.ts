/**
 * @file Implements the `toHaveResolvedTimes` matcher for the `verifies` testing framework.
 * This matcher asserts that a mock function has successfully resolved (returned a value) a specific number of times.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

/**
 * Checks if a mock function has resolved a specific number of times.
 * @param subject The mock function to check. Must be a spy function with a `mock` property.
 * @param amount The expected number of times the function should have resolved.
 * @returns `true` if the function resolved the specified number of times, `false` otherwise.
 * @throws {Error} If the subject is not a spy function.
 */
export function toHaveResolvedTimes(subject: any, amount: number): boolean {
  if (typeof subject !== 'function' || !subject.mock) {
    throw new Error('Subject must be a spy function for toHaveResolvedTimes matcher.')
  }

  const resolvedCount = subject.mock.results.filter((result: any) => result.type === 'return').length
  return resolvedCount === amount
}

declare module '../expect' {
  interface Expect<T> {
    /**
     * Asserts that a mock function has successfully resolved (returned a value) a specific number of times.
     * @param amount The expected number of times the function should have resolved.
     * @returns The `Expect` instance for chaining.
     */
    toHaveResolvedTimes(amount: number): Expect<T>
  }
}

// Extends the `Expect.prototype` to include the `toHaveResolvedTimes` matcher.
Expect.prototype.toHaveResolvedTimes = function <T>(this: Expect<T>, amount: number) {
  const { subject } = this
  const result = toHaveResolvedTimes(subject, amount)
  this.process('toHaveResolvedTimes', result, subject as T, amount as T)
  return this
}

// Registers the `toHaveResolvedTimes` matcher with the console messenger for reporting.
messengers.toHaveResolvedTimes = [binary('toHaveResolvedTimes')]