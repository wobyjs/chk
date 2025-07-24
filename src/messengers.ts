/**
 * @file Defines the structure for managing different types of messengers within the testing framework.
 * Messengers are responsible for handling the output and reporting of test results.
 */

import type { Expect } from "./expect"
import type { Messenger } from "./messenger"
// import './matcher'

/**
 * Represents a collection of messengers, where each key corresponds to a method in the `Expect` interface.
 * This allows for dynamic assignment of messengers based on the expectation method being used.
 */
export type Messengers = {
    [key in keyof Expect<any>]: [Messenger<any>]
}

/**
 * The default instance of `Messengers`, initialized as an empty object.
 * This object will be populated with specific messenger implementations for different expectation methods.
 */
export const messengers: Messengers = {} as any