/**
 * @file Provides utility functions for formatting values, serializing component props and output,
 * and performing deep equality checks, primarily used within the snapshot testing and reporting mechanisms.
 */

// Shared utilities for HTML highlighting and diff functionality
import { highlight } from 'cli-highlight'
import { diffChars } from 'diff'
import { cyanBright, yellowBright, greenBright, magentaBright, whiteBright, gray } from 'ansis'
import type { Theme } from 'cli-highlight'

// Global state to remember "accept all" choice across snapshots
let acceptAllMode = false

/**
 * Resets the accept all mode state
 */
export function resetAcceptAllMode() {
    acceptAllMode = false
}

/**
 * Checks if accept all mode is currently active
 */
export function isAcceptAllMode(): boolean {
    return acceptAllMode
}

/**
 * Formats a given value for display, typically in console messages.
 * Strings are enclosed in double quotes, Symbols are converted to their string representation,
 * and other types are returned as is.
 * @param v The value to format.
 * @returns The formatted string representation of the value.
 */
export const format = (v: any) => typeof v === 'string' ? `"${v}"` : typeof v === 'symbol' ? v.toString() : v

/**
 * Intelligently serializes component props into a consistent format for snapshot testing.
 * It handles primitive types, Dates (to ISO string), HTML Elements (to outerHTML),
 * and recursively serializes arrays and objects.
 * @param props The component props to serialize.
 * @returns A serialized representation of the props.
 */
export function serializeProps(props: any): any {
    if (props === null || typeof props !== 'object') {
        return props
    }

    if (props instanceof Date) {
        return props.toISOString() // Convert Date objects to ISO string
    }

    if (props instanceof HTMLElement) {
        // For DOM elements, return a simplified representation or outerHTML
        // This might need further refinement based on how precise we want the snapshot to be for DOM elements
        return { __DOM_ELEMENT__: props.outerHTML }
    }

    if (Array.isArray(props)) {
        return props.map(item => serializeProps(item))
    }

    const serialized: { [key: string]: any } = {}
    for (const key in props) {
        if (Object.prototype.hasOwnProperty.call(props, key)) {
            serialized[key] = serializeProps(props[key])
        }
    }
    return serialized
}

/**
 * Normalizes an HTML string for consistent comparison in snapshot tests.
 * Currently, it performs basic whitespace trimming and collapses multiple spaces into single spaces.
 * More advanced normalization (e.g., sorting attributes, removing comments) might be needed for robust comparisons.
 * @param htmlString The HTML string to serialize.
 * @returns The normalized HTML string.
 */
export function serializeOutput(htmlString: string): string {
    // Basic normalization: trim whitespace, remove extra newlines
    // More advanced normalization (e.g., sorting attributes, removing comments) might be needed
    return htmlString.replace(/\s+/g, ' ').trim()
}

/**
 * Performs a deep equality comparison between two objects.
 * Currently, it uses `JSON.stringify` for comparison, which assumes that the objects
 * can be reliably serialized to JSON and that the order of properties does not matter.
 * For more robust comparison, a dedicated deep-equal library might be used.
 * @param obj1 The first object to compare.
 * @param obj2 The second object to compare.
 * @returns `true` if the objects are deeply equal, `false` otherwise.
 */
export function areDeeplyEqual(obj1: any, obj2: any): boolean {
    // A simple deep equality check using JSON.stringify for now.
    // This assumes that serializeProps and serializeOutput produce consistently sortable JSON.
    // For more robust comparison, a dedicated deep-equal library might be used.
    return JSON.stringify(obj1) === JSON.stringify(obj2)
}


/**
 * Type representing a quoted string with either single or double quotes
 * @example
 * ```typescript
 * const quoted: QuotedString = '"hello world"';
 * const singleQuoted: QuotedString = "'hello world'";
 * ```
 */
type QuotedString = `"${string}"` | `'${string}'`

/**
 * Removes surrounding quotes from a string if they exist.
 * 
 * @param str - The string to unquote
 * @returns The string without surrounding quotes, or the original string if no quotes are found
 * 
 * @example
 * ```typescript
 * unquote('"hello"') // returns 'hello'
 * unquote("'world'") // returns 'world'
 * unquote('test')    // returns 'test'
 * ```
 */
export function unquote<T extends string>(str: T): string {
    return str.replace(/^(['"])(.*)\1$/, '$2')
}

/**
 * Handles user input in interactive mode for snapshot testing.
 * Prompts the user with [Y]es/[N]o/[A]ll/[C]ancel options and returns their choice.
 * @param message The message to display to the user
 * @returns A promise that resolves to 'accept', 'reject', 'accept-all', or 'cancel'
 */
export async function promptUser(message: string): Promise<'accept' | 'reject' | 'accept-all' | 'cancel'> {
    // If accept all mode is active, automatically accept
    if (acceptAllMode) {
        return 'accept'
    }

    // Try to use readline if available (Node.js environment)
    try {
        const readline = await import('node:readline')
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        return new Promise((resolve) => {
            process.stdin.setRawMode(true)
            process.stdin.setEncoding('utf8')

            console.log(`${message} [Y]es/[N]o/[A]ll/[C]ancel: `)

            const handleInput = (key: string) => {
                if (key === 'y' || key === 'Y') {
                    process.stdin.removeListener('data', handleInput)
                    process.stdin.setRawMode(false)
                    rl.close()
                    console.log('Y')
                    resolve('accept')
                } else if (key === 'n' || key === 'N') {
                    process.stdin.removeListener('data', handleInput)
                    process.stdin.setRawMode(false)
                    rl.close()
                    console.log('N')
                    resolve('reject')
                } else if (key === 'a' || key === 'A') {
                    process.stdin.removeListener('data', handleInput)
                    process.stdin.setRawMode(false)
                    rl.close()
                    console.log('A')
                    // Set accept all mode globally
                    acceptAllMode = true
                    resolve('accept-all')
                } else if (key === 'c' || key === 'C' || key === '\u0003') { // Ctrl+C
                    process.stdin.removeListener('data', handleInput)
                    process.stdin.setRawMode(false)
                    rl.close()
                    console.log('C')
                    resolve('cancel')
                }
            }

            process.stdin.on('data', handleInput)
        })
    } catch (e) {
        // Fallback for environments where readline is not available
        console.log(`${message} (Interactive mode not available in this environment)`)
        return 'reject'
    }
}

/**
 * Highlights HTML with syntax highlighting
 * @param html The HTML string to highlight
 * @returns The highlighted HTML string
 */
export function highlightHtml(html: string) {
    try {
        return highlight(html, {
            language: 'xml',
            ignoreIllegals: true,
            theme: {
                tag: cyanBright,         // HTML tags like <div>
                name: yellowBright,      // Attribute names like class, id
                string: greenBright,     // Attribute values like "box"
                attr: magentaBright,     // Optional: differentiate attr vs name
                default: whiteBright,    // Fallback for unstyled tokens
            }
        })
    } catch (e) {
        return html
    }
}

/**
 * Shows a character-level diff between two strings
 * @param current The current output
 * @param expected The expected output
 * @returns An object containing the formatted diff string and styles
 */
export function showDiff(current: string, expected: string) {
    const diffs = diffChars(expected, current)
    const formatted = diffs.map((part: any) => {
        if (part.added) {
            return `%c${part.value}%c`
        } else if (part.removed) {
            return `%c${part.value}%c`
        } else {
            return part.value
        }
    }).join('')

    const styles: string[] = []
    diffs.forEach((part: any) => {
        if (part.added) {
            styles.push('color: #D5FF9E;')
            styles.push('') // Reset style
        } else if (part.removed) {
            styles.push('color: #FA7C7A; text-decoration: line-through;')
            styles.push('') // Reset style
        }
    })

    return {
        formatted,
        styles
    }
}