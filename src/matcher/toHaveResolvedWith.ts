/**
 * @file Implements the `toHaveResolvedWith` matcher for the `@woby/chk` testing framework.
 * This matcher asserts that a mock function has resolved (returned a value) with a specific value at least once.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'
import { equals } from './equals'
import { type fn } from '../fn'

/**
 * Checks if a mock function has resolved with a specific value at least once.
 * @param subject The mock function to check. Must be a spy function with a `mock` property.
 * @param expected The expected value of the resolution.
 * @returns A Promise that resolves to `true` if the function has resolved with the expected value, `false` otherwise.
 * @throws {Error} If the subject is not a spy function.
 */
export async function toHaveResolvedWith(subject: ReturnType<typeof fn>, expected: any) {
  if (typeof subject !== 'function' || !subject.mock) {
    throw new Error('Subject must be a spy function for toHaveResolvedWith matcher.')
  }

  // return subject.mock.results.some(async (result: any) => result.type === 'return' && equals(await result.value, expected))

  const checks = await Promise.all(
    subject.mock.results.map(async (result) =>
      result.type === 'return' && equals(await result.value, expected)
    )
  )

  return checks.some(Boolean)

}

declare module '../expect' {
  interface Expect<T> {
    /**
     * Asserts that a mock function has resolved (returned a value) with a specific value at least once.
     * @param expected The expected value of the resolution.
     * @returns A Promise that resolves to the `Expect` instance for chaining.
     */
    toHaveResolvedWith: <T>(this: Expect<T>, expected: any) => Promise<Expect<T>> //<T extends ReturnType<typeof fn>>(): Expect<T>
  }
}

// Extends the `Expect.prototype` to include the `toHaveResolvedWith` matcher.
Expect.prototype.toHaveResolvedWith = async function <T>(this: Expect<T>, expected: any) {
  const { subject } = this
  const result = await toHaveResolvedWith(subject as any, expected)
  this.process('toHaveResolvedWith', result, subject as T, expected)
  return this
}

// Registers the `toHaveResolvedWith` matcher with the console messenger for reporting.
messengers.toHaveResolvedWith = [binary('toHaveResolvedWith')]