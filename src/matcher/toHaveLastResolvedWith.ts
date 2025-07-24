/**
 * @file Implements the `toHaveLastResolvedWith` matcher for the `verifies` testing framework.
 * This matcher asserts that a mock function's last successful resolution (return value) matches a given expected value.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'
import { equals } from './equals'

/**
 * Checks if the last resolved value of a mock function matches the expected value.
 * @param subject The mock function to check. Must be a spy function with a `mock` property.
 * @param expected The expected value of the last resolution.
 * @returns A Promise that resolves to `true` if the last resolved value matches, `false` otherwise.
 * @throws {Error} If the subject is not a spy function.
 */
export async function toHaveLastResolvedWith(subject: any, expected: any) {
  if (typeof subject !== 'function' || !subject.mock) {
    throw new Error('Subject must be a spy function for toHaveLastResolvedWith matcher.')
  }

  const resolvedResults = subject.mock.results.filter((result: any) => result.type === 'return')
  if (resolvedResults.length === 0) {
    return false
  }

  const lastResolved = resolvedResults[resolvedResults.length - 1]
  return equals(await lastResolved.value, expected)
}

declare module '../expect' {
  interface Expect<T> {
    /**
     * Asserts that a mock function's last successful resolution (return value) matches a given expected value.
     * @param expected The expected value of the last resolution.
     * @returns A Promise that resolves to the `Expect` instance for chaining.
     */
    toHaveLastResolvedWith: <T>(this: Expect<T>, expected: any) => Promise<Expect<T>>
  }
}

// Extends the `Expect.prototype` to include the `toHaveLastResolvedWith` matcher.
Expect.prototype.toHaveLastResolvedWith = async function <T>(this: Expect<T>, expected: any) {
  const { subject } = this
  const result = await toHaveLastResolvedWith(subject, expected)
  this.process('toHaveLastResolvedWith', result, subject as T, expected)
  return this
}

// Registers the `toHaveLastResolvedWith` matcher with the console messenger for reporting.
messengers.toHaveLastResolvedWith = [binary('toHaveLastResolvedWith')]