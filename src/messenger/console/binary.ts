/**
 * @file Implements the `binary` messenger for console output, specifically designed for binary assertions.
 * This messenger formats the subject, operator, and target values, applying color based on the assertion result.
 */

import { format } from '../../utils'
import { Messenger } from '../../messenger'
import { ResultType } from '../../expect'
import { diffChars } from 'diff'

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
        const operatorColor = result ? 'color:#D5FF9E' : 'color:#FA7C7A'
        const s = typeof subject === 'function' ? 'function' : subject
        const sp = operator[operator.length - 1] === '\n' ? '' : ' '
        const nl = operator[operator.length - 1] === '\n' ? '\n' : ''

        try {
            // For string comparisons, show character-level differences
            if (typeof subject === 'string' && typeof target === 'string' && !result) {
                const diffs = diffChars(subject, target)
                const formattedDiffs = diffs.map(part => {
                    if (part.added) {
                        return `%c${part.value}%c`
                    } else if (part.removed) {
                        return `%c${part.value}%c`
                    } else {
                        return part.value
                    }
                }).join('')

                const styles = [] as string[]
                diffs.forEach(part => {
                    if (part.added) {
                        styles.push('color: #D5FF9E;')
                        styles.push('') // Reset style
                    } else if (part.removed) {
                        styles.push('color: #FA7C7A;')
                        styles.push('') // Reset style
                    }
                })

                return [`${nl}%c${format(s)} %c${operator}${sp}%c${format(formattedDiffs)}`, 'font-weight:normal', operatorColor, 'color:notset', ...styles]
            }


            return [`${nl}%c${format(s)} %c${operator}${sp}%c${format(target)}`, 'font-weight:normal', operatorColor, 'font-weight:normal']
        }
        catch (e) {
            console.error(e)
        }
    }