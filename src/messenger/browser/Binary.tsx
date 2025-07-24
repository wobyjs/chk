/**
 * @file Implements the `Binary` component, a browser-specific messenger for displaying binary test results.
 * This component visually represents the outcome of a binary assertion (e.g., equality, comparison)
 * by coloring the subject and target based on the test result.
 */

import { type JSX } from 'woby' // Changed import
import { ResultType } from '../../expect'

/**
 * Props for the `Binary` component.
 */
interface BinaryProps {
    /** The operator used in the binary assertion (e.g., "===", ">", "includes"). */
    operator: string
    /** The result of the assertion (`true` for pass, `false` for fail, "info", "warn"). */
    result: ResultType
    /** The subject value of the assertion, which can be a string or a JSX element. */
    subject: string | JSX.Element
    /** The target value of the assertion, which can be a string or a JSX element. */
    target: string | JSX.Element
}

/**
 * A functional component that displays the result of a binary assertion.
 * It renders the subject, operator, and target, with the text color indicating success (green) or failure (red).
 * @param props The `BinaryProps` containing the operator, result, subject, and target.
 * @returns A `<span>` element displaying the formatted binary assertion result.
 */
export const Binary = ({ result, subject, target, operator }: BinaryProps) => // Changed ReactNode to JSX.Element
    <span style={{ color: result ? 'green' : 'red' }}>{subject} <b>{operator}</b> {target}</span>