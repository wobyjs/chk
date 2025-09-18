/**
 * @file Implements the `check` messenger for console output, providing a visual indication of test success or failure.
 * This messenger formats test results with a checkmark or cross mark and applies color for clarity.
 */

import { ResultType } from '../../expect'
import { Messenger } from '../../messenger'

/**
 * A console messenger that formats a test result for display in the browser console.
 * It uses colors to indicate success (green checkmark) or failure (red cross mark).
 *
 * @template T The type of the subject and target values.
 * @param result The boolean result of the test (`true` for pass, `false` for fail, or "info"/"warn").
 * @param subject The actual value being tested.
 * @param target The expected value.
 * @param previousMessage An optional array of previous messages to prepend to the current message.
 * @returns An array of strings formatted for `console.log`, including CSS for coloring.
 */
export const check: Messenger<string> =
    <T>(result: ResultType, subject: T, target: T, previousMessage = [] as string[]) => {
        const [h, ...tail] = previousMessage
        // Add extra spacing to make the output more readable
        const args = [`%c${result ? '✓' : '✗'} %c${h}`, result ? 'color:#D5FF9E' : 'color:#FA7C7A', 'font-weight:normal'].concat(tail.length > 0 ? tail : [""])
        return args
    }