/**
 * @file Implements the `toHaveResolved` matcher for the `verifies` testing framework.
 * This matcher asserts that a mock function has resolved (returned a value) at least once.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'
import { fn } from '../fn'

/**
 * Checks if a mock function has resolved at least once.
 * @param subject The mock function to check. Must be a spy function with a `mock` property.
 * @returns `true` if the function has resolved, `false` otherwise.
 * @throws {Error} If the subject is not a spy function.
 */
export function toHaveResolved(subject: any): boolean {
  if (typeof subject !== 'function' || !subject.mock) {
    throw new Error('Subject must be a spy function for toHaveResolved matcher.')
  }

  return subject.mock.results.some((result: any) => result.type === 'return')
}

declare module '../expect' {
  interface Expect<T> {
    /**
     * Asserts that a mock function has resolved (returned a value) at least once.
     * @template T The type of the mock function.
     * @returns The `Expect` instance for chaining.
     */
    toHaveResolved<T extends ReturnType<typeof fn>>(): Expect<T>
  }
}

// Extends the `Expect.prototype` to include the `toHaveResolved` matcher.
Expect.prototype.toHaveResolved = function <T>(this: Expect<T>): Expect<T> {
  const { subject } = this
  const result = toHaveResolved(subject)
  this.process('toHaveResolved', result, subject as T, null as T)
  return this
}

// Registers the `toHaveResolved` matcher with the console messenger for reporting.
messengers.toHaveResolved = [binary('toHaveResolved')]