/**
 * @file Implements the `Result` component, a browser-specific messenger for displaying a simple pass/fail indicator.
 * This component visually represents the outcome of a test or assertion using a checkmark or a cross mark,
 * colored green for success and red for failure.
 */

import type { ResultType } from '../../expect'

/**
 * Props for the `Result` component.
 */
interface ResultProps {
    /** The result of the assertion (`true` for pass, `false` for fail, "info", "warn"). */
    result: ResultType
}

/**
 * A functional component that displays a visual indicator for a test result.
 * It renders a green checkmark for success (`true`) and a red cross mark for failure (`false`).
 * @param props The `ResultProps` containing the test result.
 * @returns A `<span>` element displaying the formatted result indicator.
 */
export const Result = ({ result }: ResultProps) =>
    <span style={{ color: result ? '#D5FF9E' : '#FA7C7A' }}>{result ? '✓' : '✗'}</span>