/**
 * @file Defines the Match and Matcher interfaces for the testing framework.
 */

import type { Expect } from "./expect"

/**
 * Represents a function that takes a subject and returns an Expectation.
 * This is used for custom matchers where the subject needs to be passed through.
 * @template T The type of the subject being matched.
 */
export interface Match<T> {
    (subject: T): Expect<T>
}

/**
 * A marker interface for all matcher implementations.
 * Matchers are objects that contain methods for asserting conditions on values.
 */
export interface Matcher { }