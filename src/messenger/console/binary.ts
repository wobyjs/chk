/**
 * @file Implements the `binary` messenger for console output, specifically designed for binary assertions.
 * This messenger formats the subject, operator, and target values, applying color based on the assertion result.
 */

import { format, highlightHtml, showDiff } from '../../utils'
import { Messenger } from '../../messenger'
import { ResultType } from '../../expect'
import { diffChars } from 'diff'
import { plain } from 'cli-highlight'


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
        const operatorColor = result ? 'color:#4CAF50; font-weight:bold;' : 'color:#F44336; font-weight:bold;'
        const s = typeof subject === 'function' ? 'function' : subject
        const sp = operator[operator.length - 1] === '\n' ? '' : ' '
        const nl = operator[operator.length - 1] === '\n' ? '\n' : ''
        const isHtml = operator.startsWith('html')
        const [o, n] = isHtml ? ['- ', '+ '] : ['', '']

        const hf = (s: any) => isHtml ? highlightHtml(s) : format(s)
        //const d = showDiff(hf(subject as string), hf(target as string))
        if (typeof subject === 'string' && typeof target === 'string' && !result) {
            const d = showDiff(subject as string, target as string)
            const { formatted, styles } = d

            if (isHtml)
                return [`${nl}%c${o}${hf(s as string)} %c${operator}${sp}%c${n}${hf(formatted)}`, 'font-weight:normal', operatorColor, 'color:notset', ...styles]
            return [`${nl}%c${hf(s as string)} %c${operator}${sp}%c${hf(target)}`, 'font-weight:normal', operatorColor, 'color:notset', ...styles]
        }

        return [`${nl}%c${hf(s)} %c${operator}${sp}%c${hf(target)}`, 'font-weight:normal', operatorColor, 'font-weight:normal']

        // return [`${nl}%c${o}${hf(s as string)} %c${operator}${sp}%c${n}${hf(formatted)}`, 'font-weight:normal', operatorColor, 'color:notset', ...styles]

    }