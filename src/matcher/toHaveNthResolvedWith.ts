/**
 * @file Implements the `toHaveNthResolvedWith` matcher for the `verifies` testing framework.
 * This matcher asserts that a mock function's Nth successful resolution (return value) matches a given expected value.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'
import { equals } from './equals'

/**
 * Checks if the Nth resolved value of a mock function matches the expected value.
 * @param subject The mock function to check. Must be a spy function with a `mock` property.
 * @param n The 1-based index of the resolution to check.
 * @param expected The expected value of the Nth resolution.
 * @returns A Promise that resolves to `true` if the Nth resolved value matches, `false` otherwise.
 * @throws {Error} If the subject is not a spy function.
 */
export async function toHaveNthResolvedWith(subject: any, n: number, expected: any) {
  if (typeof subject !== 'function' || !subject.mock) {
    throw new Error('Subject must be a spy function for toHaveNthResolvedWith matcher.')
  }

  const resolvedResults = subject.mock.results.filter((result: any) => result.type === 'return')
  if (n <= 0 || n > resolvedResults.length) {
    return false
  }

  const nthResolved = resolvedResults[n - 1]
  return equals(await nthResolved.value, expected)
}

declare module '../expect' {
  interface Expect<T> {
    /**
     * Asserts that a mock function's Nth successful resolution (return value) matches a given expected value.
     * @param n The 1-based index of the resolution to check.
     * @param expected The expected value of the Nth resolution.
     * @returns A Promise that resolves to the `Expect` instance for chaining.
     */
    toHaveNthResolvedWith: <T>(this: Expect<T>, n: number, expected: any) => Promise<Expect<T>>
  }
}

// Extends the `Expect.prototype` to include the `toHaveNthResolvedWith` matcher.
Expect.prototype.toHaveNthResolvedWith = async function <T>(this: Expect<T>, n: number, expected: any) {
  const { subject } = this
  const result = await toHaveNthResolvedWith(subject, n, expected)
  this.process('toHaveNthResolvedWith', result, subject as T, expected as T)
  return this
}

// Registers the `toHaveNthResolvedWith` matcher with the console messenger for reporting.
messengers.toHaveNthResolvedWith = [binary('toHaveNthResolvedWith')]