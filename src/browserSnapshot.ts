/**
 * @file This file contains the logic for handling browser-based snapshot testing.
 * It includes functions for comparing, loading, and saving snapshots.
 */

/**
 * Represents the result of a snapshot comparison.
 */
export interface SnapshotResult {
    /** Indicates whether the actual output matched the expected snapshot. */
    match: boolean
    /** Optional: A string representing the difference between the expected and actual output, if they don't match. */
    diff?: string
    /** Optional: The expected snapshot content, if available and a mismatch occurred. */
    expected?: string
    /** Optional: The actual output content, if a mismatch occurred. */
    actual?: string
}

/**
 * Compares an actual output with an expected snapshot and returns a `SnapshotResult`.
 * @param expected The expected snapshot content.
 * @param actual The actual output to compare.
 * @returns A `SnapshotResult` object indicating whether the snapshot matched and providing diff information if it didn't.
 */
export function compareSnapshot(expected: string, actual: string): SnapshotResult {
    if (expected === actual) return { match: true }
    // For now, just a simple diff (could use a real diff lib later)
    return {
        match: false,
        expected,
        actual,
        diff: `Expected and actual output differ.`
    }
}

// Re-export the environment-agnostic snapshot utilities
// This maintains backward compatibility while using the new implementation
export { loadSnapshot, saveSnapshot } from './utils/snapshotUtils'