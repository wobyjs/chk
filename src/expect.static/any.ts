/**
 * @file Defines the `any` static matcher for the `verifies` testing framework.
 * This matcher allows for flexible type-based assertions, where a value is expected to be of a certain type
 * rather than an exact value.
 */

/**
 * A unique symbol used to identify `any` matchers.
 */
export const ANY_SYMBOL = Symbol.for('ANY')

/**
 * Creates an `any` matcher that asserts a value is an instance of a given constructor or a specific primitive type.
 * This is useful when you want to check the type of a value without caring about its exact content.
 * 
 * @template T The constructor function (e.g., `String`, `Number`, `Array`, `Object`, or a custom class).
 * @param expectedConstructor The constructor function or primitive type to match against.
 * @returns An object representing the `any` matcher, including its type and a custom `toString` method for better test reporting.
 */
export function any<T extends Function>(expectedConstructor: T): { [ANY_SYMBOL]: true; expectedConstructor: T; toString: () => string } {
    return {
        [ANY_SYMBOL]: true,
        expectedConstructor,
        toString: () => `any(${(expectedConstructor as any).name})`
    }
}