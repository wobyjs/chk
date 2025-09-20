/**
 * @file Implements the `htmlToMatchSnapshot` matcher for the `verifies` testing framework.
 * This matcher asserts that an HTML string matches a stored snapshot.
 */

import { Expect } from '../expect'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'
import { loadSnapshot, saveSnapshot } from '../utils/snapshotUtils'
import { areDeeplyEqual } from '../utils'

declare module '../expect' {
    interface Expect<T> {
        /**
         * Asserts that the HTML subject matches a stored snapshot.
         * If no snapshot exists, one is created. If a snapshot exists but doesn't match,
         * the test fails.
         * @param snapshotName The name/identifier for the snapshot.
         * @returns The `Expect` instance for chaining.
         */
        htmlToMatchSnapshot(snapshotName: string): Promise<Expect<T>>
    }
}

// Extends the `Expect.prototype` to include the `htmlToMatchSnapshot` matcher.
Expect.prototype.htmlToMatchSnapshot = async function <T>(this: Expect<T>, snapshotName: string) {
    const { subject } = this

    // Ensure the subject is a string (HTML)
    if (typeof subject !== 'string') {
        this.process('htmlToMatchSnapshot', false, subject as T, `Expected string HTML, got ${typeof subject}` as any)
        return this
    }

    try {
        // Try to load existing snapshot
        const loadedSnapshot = await loadSnapshot(snapshotName)

        if (!loadedSnapshot) {
            // No existing snapshot, create one
            await saveSnapshot(snapshotName, JSON.stringify({}), subject)
            this.process('htmlToMatchSnapshot', true, subject as T, 'New snapshot created' as any)
            return this
        }

        // Compare with existing snapshot
        const snapshotContent = loadedSnapshot.html
        const match = areDeeplyEqual(subject, snapshotContent)

        this.process('htmlToMatchSnapshot', match, subject as T, snapshotContent as any)
    } catch (error) {
        this.process('htmlToMatchSnapshot', false, subject as T, `Error: ${(error as Error).message}` as any)
    }

    return this
}

// Registers the `htmlToMatchSnapshot` matcher with the console messenger for reporting.
messengers.htmlToMatchSnapshot = [binary('htmlToMatchSnapshot')]