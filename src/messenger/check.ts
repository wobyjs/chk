/**
 * @file Implements the `check` messenger, which provides a basic console-based reporting mechanism
 * for test results, indicating success or failure with a checkmark or cross mark.
 */

import { ResultType } from '../expect'
import { Messenger } from '../messenger'

/**
 * A messenger function that formats a test result into a simple string indicating success or failure.
 * It prepends a checkmark (✓) for passing tests or a cross mark (✗) for failing tests
 * to the combined previous messages.
 * 
 * @template T The type of the subject and target values (not directly used in formatting, but part of the Messenger interface).
 * @param result The boolean result of the test (`true` for pass, `false` for fail).
 * @param subject The subject of the test (not used in this messenger's formatting).
 * @param target The target of the test (not used in this messenger's formatting).
 * @param previousMessage Optional: An array of strings representing messages from previous steps in the reporting chain.
 * @returns An array containing a single formatted string message.
 */
export const check: Messenger<string> =
    <T>(result: ResultType, subject: T, target: T, previousMessage?: string[]) => [`${result ? '✔' : '✘'} ${(previousMessage ?? []).join(' ')}`]