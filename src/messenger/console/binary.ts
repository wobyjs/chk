/**
 * @file Implements the `binary` messenger for console output, specifically designed for binary assertions.
 * This messenger formats the subject, operator, and target values, applying color based on the assertion result.
 */

import { format } from '../../utils'
import { Messenger } from '../../messenger'
import { ResultType } from '../../expect'
import { diffChars } from 'diff'
import { highlight, plain, Theme } from 'cli-highlight'
import { cyanBright, yellowBright, greenBright, magentaBright, whiteBright, gray } from 'ansis'


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
        const operatorColor = result ? 'color:#D5FF9E; font-weight:bold;' : 'color:#FA7C7A; font-weight:bold;'
        const s = typeof subject === 'function' ? 'function' : subject
        const sp = operator[operator.length - 1] === '\n' ? '' : ' '
        const nl = operator[operator.length - 1] === '\n' ? '\n' : ''
        const isHtml = operator.startsWith('html')

        const hf = (s: any) => isHtml ? highlight(s, {
            language: 'xml', ignoreIllegals: true, theme: {
                tag: cyanBright,         // HTML tags like <div>
                name: yellowBright,      // Attribute names like class, id
                string: greenBright,     // Attribute values like "box"
                attr: magentaBright,     // Optional: differentiate attr vs name
                punctuation: gray,       // Symbols like <, >, /, =
                default: whiteBright,    // Fallback for unstyled tokens
            } as Theme
        }) : format(s)

        try {
            // For string comparisons, show character-level differences
            if (typeof subject === 'string' && typeof target === 'string' && !result) {
                const diffs = diffChars(target, subject)
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
                // console.log(hf(s as string))
                return [`${nl}%c${hf(s as string)} %c${operator}${sp}%c${hf(formattedDiffs)}`, 'font-weight:normal', operatorColor, 'color:notset', ...styles]
            }

            return [`${nl}%c${hf(s)} %c${operator}${sp}%c${hf(target)}`, 'font-weight:normal', operatorColor, 'font-weight:normal']
        }
        catch (e) {
            console.error(e)
        }
    }