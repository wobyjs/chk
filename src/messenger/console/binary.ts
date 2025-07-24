/**
 * @file Implements the `binary` messenger for console output, specifically designed for binary assertions.
 * This messenger formats the subject, operator, and target values, applying color based on the assertion result.
 */

import { format } from '../../utils'
import { Messenger } from '../../messenger'
import { ResultType } from '../../expect'

/**
 * Creates a messenger function that formats binary assertion results for console output.
 * The output includes the subject, the specified operator, and the target, with colors indicating pass/fail.
 * 
 * @param operator The string representation of the operator used in the assertion (e.g., "===", ">", "includes").
 * @returns A `Messenger` function that takes the result, subject, and target of an assertion
 *          and returns an array suitable for `console.log` with formatting.
 */
export const binary = (operator: string): Messenger<string> =>
    <T>(result: ResultType, subject: T, target: T, previousMessage?: string[]) => {
        const color = result ? 'color:green' : 'color:red'
        const s = typeof subject === 'function' ? 'function' : subject
        try {
            return [`%c${format(s)} %c${operator} %c${format(target)}%c`, color, 'font-weight:bold', color, '']
        }
        catch (e) {
            console.error(e)
        }
    }