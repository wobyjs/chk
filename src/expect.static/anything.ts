/**
 * @file Defines the `anything` static matcher for the `@woby/chk` testing framework.
 * This matcher allows for assertions where any value is considered a match, regardless of its type or content.
 */

/**
 * A unique symbol used to identify `anything` matchers.
 */
export const ANYTHING_SYMBOL = Symbol.for('ANYTHING')

// class Anything {
//     constructor() { }
//     [ANYTHING_SYMBOL]: true
//     toString: () => 'anything'
// }

/**
 * A special matcher that matches any value.
 * When used in an assertion, it signifies that the actual value can be anything.
 * It includes a custom `toString` method for better test reporting.
 */
const obj = { [ANYTHING_SYMBOL]: true, toString: () => 'anything', prototype: { name: null as any } }

export const anything = Object.assign(() => obj, obj) as any