/**
 * @file Provides utility functions for binding static `expect` matchers to the `expect` function.
 * This allows for a more fluent and convenient syntax when writing assertions.
 */

import * as ext from './expect.static'

/**
 * Binds properties from one object (`p`) to another object (`expect`).
 * This is a generic utility function that can be used to extend objects with new functionalities.
 * @template T The type of the target object to which properties will be bound.
 * @template P The type of the source object from which properties will be bound.
 * @param expect The target object to which properties will be bound.
 * @param p The source object whose properties will be bound to the target.
 * @returns The target object with the new properties bound.
 */
export const bind = <T, P>(expect: T, p: P) => Object.assign(expect, p)

/**
 * Binds all static `expect` matchers (from `expect.static`) to a given `expect` function.
 * This function is typically used to augment the `expect` function with all available matchers,
 * enabling a fluent assertion API.
 * @template T The type of the `expect` function to which static matchers will be bound.
 * @template P The type of the static matchers object (inferred from `ext`).
 * @param expect The `expect` function to which static matchers will be bound.
 * @returns The `expect` function augmented with all static matchers.
 */
export const binds = <T, P>(expect: T) => {
    return bind(expect, ext)

    // return expect as T & typeof ext
}