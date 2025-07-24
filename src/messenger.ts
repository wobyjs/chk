/**
 * @file Defines the Messenger interface, which is crucial for handling and formatting test results.
 * Messengers are responsible for transforming raw test outcomes into human-readable messages or other desired formats.
 */

import type { ResultType } from './expect'

/**
 * Represents a function that processes a test result and returns a formatted message or data.
 * This interface is generic, allowing for different return types based on the specific messenger implementation.
 * 
 * @template R The type of the formatted result or message that the messenger will return.
 */
export interface Messenger<R> {
    /**
     * Processes a test result and generates a formatted output.
     * 
     * @param result The raw result of the test expectation (e.g., success, failure, error).
     * @param subject The actual value being tested.
     * @param target The expected value or target against which the subject is compared.
     * @param previousMessage Optional array of previous messages, useful for chaining or accumulating results.
     * @returns An array of formatted results or messages of type `R`.
     */
    <T>(result: ResultType, subject: T, target: T, previousMessage?: R[]): R[]
}