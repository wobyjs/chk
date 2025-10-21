/**
 * @file Implements the `SnapshotTest` class, a specialized test type for managing and comparing UI snapshots.
 * This class extends the base `Test` class to provide functionality for loading, saving, and comparing rendered component outputs.
 */

import { Test } from './test'
import { areDeeplyEqual, unquote, highlightHtml, showDiff, isAcceptAllMode, resetAcceptAllMode } from './utils' // Import the new utility function
import { Expect } from './expect' // Import Expect to create assertions
import { loadSnapshot, saveSnapshot } from './utils/snapshotUtils'
import { promptUser } from './utils'
import { $, Stack } from 'woby'
import { diffChars } from 'diff'

/**
 * Defines the structure of a snapshot file, which contains the props and output of a component for a given state.
 */
interface SnapshotContent {
    /** The serialized props of the component at the time the snapshot was taken. */
    props: any
    /** The HTML output of the component at the time the snapshot was taken. */
    output: string
    /** The shadowRoot content of the component at the time the snapshot was taken. */
    shadowRoot?: string
    // Add any other metadata if needed, e.g., timestamp, version
}

/**
 * A specialized `Test` class for snapshot testing. It compares the current output of a component with a stored snapshot.
 * It handles loading existing snapshots, performing comparisons, and saving new or updated snapshots.
 */
export class SnapshotTest extends Test<string> {
    private snapshotName: string
    private currentProps: any
    private currentOutput: string
    private expectedSnapshot: SnapshotContent | null = null
    /** A reactive signal that holds the loaded snapshot content or a placeholder message. */
    public loadedSnapshot = $<JSX.Child>()

    /**
     * Creates a new `SnapshotTest` instance.
     * @param name The unique name for this snapshot, used to identify the snapshot file.
     * @param currentProps The current props of the component being tested.
     * @param currentOutput The current rendered HTML output of the component.
     * @param stack The stack trace associated with the creation of this snapshot test, for debugging and reporting.
     */
    constructor(name: string, currentProps: any, currentOutput: string, stack: Stack) {
        // The 'subject' for this Test instance will be the snapshot name
        super(name, stack)
        this.snapshotName = name
        this.currentProps = currentProps
        this.currentOutput = unquote(currentOutput)

    }

    /**
     * Executes the snapshot test. This involves loading any existing snapshot, comparing it with the current output,
     * and updating the test result based on the comparison.
     * If no snapshot exists, it creates a new one.
     */
    public async test(interactive = false) {
        this.modules = []

        const loadedSnapshot = await loadSnapshot(this.snapshotName)
        if (loadedSnapshot) {
            this.expectedSnapshot = {
                props: loadedSnapshot.props,
                output: unquote(loadedSnapshot.html),
                // shadowRoot: loadedSnapshot.shadowRoot ? unquote(loadedSnapshot.shadowRoot) : undefined
            }
        }

        this.loadedSnapshot(this.expectedSnapshot?.output ?? 'Saving initial snapshot')

        // Create an Expect instance to manage the result of the snapshot comparison
        const snapshotExpect = new Expect<string>(this.currentOutput, `Snapshot for '${this.snapshotName}'`, this)
        this.modules.push(snapshotExpect) // Add it to the test's modules

        if (!this.expectedSnapshot) {
            // No existing snapshot, so this is a new snapshot.
            snapshotExpect.process('newSnapshot', true, this.currentOutput, 'No existing snapshot')
            console.log(`%c[SnapshotTest] No existing snapshot for '${this.snapshotName}'. New snapshot created.`, 'color: orange; font-weight: bold;')
            await this.save()
            this.loadedSnapshot(this.expectedSnapshot?.output ?? 'Saving initial snapshot. Done...')
            return
        }

        // Compare current props with snapshot props
        const propsMatch = areDeeplyEqual(this.currentProps, this.expectedSnapshot.props)
        // Compare current output with snapshot output
        const outputMatch = areDeeplyEqual(this.currentOutput, this.expectedSnapshot.output)
        // Compare current shadowRoot with snapshot shadowRoot (if both exist)
        // const shadowRootMatch = this.currentShadowRoot && this.expectedSnapshot.shadowRoot
        //     ? areDeeplyEqual(this.currentShadowRoot, this.expectedSnapshot.shadowRoot)
        //     : true // If either is missing, consider it a match

        // const overallMatch = propsMatch && outputMatch && shadowRootMatch
        const overallMatch = propsMatch && outputMatch

        if (!overallMatch) {
            // Check which specific part failed
            if (!outputMatch) {
                snapshotExpect.process('html mismatch\n', false, this.currentOutput, this.expectedSnapshot.output)
            }
            // else if (!shadowRootMatch) {
            //     snapshotExpect.process('shadowRoot mismatch\n', false, this.currentShadowRoot, this.expectedSnapshot.shadowRoot || '')
            // } 
            else {
                snapshotExpect.process('props mismatch\n', false, JSON.stringify(this.currentProps), JSON.stringify(this.expectedSnapshot.props))
            }
            // console.log(`%c[SnapshotTest] Snapshot mismatch for '${this.snapshotName}'!`, 'color: red; font-weight: bold;')

            // Handle interactive mode for snapshot mismatches
            if (interactive) {
                console.log('\n%cInteractive Snapshot Testing:', 'font-weight:bold;color:yellow')
                console.log(`%cSnapshot mismatch detected for '${this.snapshotName}'`, 'color:orange')

                // Show a simple character-level diff
                if (!outputMatch) {
                    this.showDiff(this.showHtml(this.currentOutput), this.showHtml(this.expectedSnapshot.output))
                }
                // else if (!shadowRootMatch && this.expectedSnapshot.shadowRoot) {
                //     this.showDiff(this.showHtml(this.currentShadowRoot), this.showHtml(this.expectedSnapshot.shadowRoot))
                // }

                console.log('%cCurrent output differs from saved snapshot.', 'color:orange')

                try {
                    const choice = await promptUser('Do you want to accept this new snapshot?')

                    if (choice === 'accept' || choice === 'accept-all') {
                        console.log('%cAccepting new snapshot...', 'color:blue')
                        await this.save()
                        console.log('%cSnapshot updated successfully!', 'color:green')
                        // Update the expectation result after saving
                        snapshotExpect.process('html match\n', true, this.currentOutput, this.expectedSnapshot.output)
                        // If this was an 'accept-all' choice, inform the user
                        if (choice === 'accept-all') {
                            console.log('%cAccept All mode activated. All subsequent snapshots will be automatically accepted.', 'color:blue')
                        }
                    } else {
                        // Reset accept all mode if user rejects
                        if (isAcceptAllMode()) {
                            resetAcceptAllMode()
                            console.log('%cAccept All mode deactivated.', 'color:gray')
                        }
                        console.log('%cSnapshot rejected. Keeping existing snapshot.', 'color:gray')
                    }
                } catch (error) {
                    console.error('Error in interactive mode:', error)
                }
            }
        } else {
            snapshotExpect.process('html match\n', true, this.currentOutput, this.expectedSnapshot.output)
            // console.log(`%c[SnapshotTest] Snapshot for '${this.snapshotName}' matches.`, 'color: green; font-weight: bold;')
        }
        const r = this.result

        this.tested(Math.random())
    }

    /**
     * Shows HTML with syntax highlighting using the same technique as binary.ts
     * @param html The HTML string to display
     */
    private showHtml(html: string) {
        return highlightHtml(html)
    }

    /**
     * Shows a character-level diff between two strings using the same technique as binary.ts
     * @param current The current output
     * @param expected The expected output
     */
    private showDiff(current: string, expected: string) {
        console.log('\n%cDiff (expected -> current):', 'font-weight:bold')

        const diffResult = showDiff(current, expected)

        console.log('- ' + current)
        console.log('+ ' + diffResult.formatted, ...diffResult.styles)
        console.log('') // Add a blank line for better readability
    }

    /**
     * Saves the current component's props and rendered output as a new snapshot.
     * This is typically called when a snapshot test fails and the new output is accepted as the correct one.
     */
    async save() {
        try {
            // await saveSnapshot(this.snapshotName, this.currentProps, this.currentOutput, this.currentShadowRoot)
            await saveSnapshot(this.snapshotName, this.currentProps, this.currentOutput)
            await this.test()
        } catch { }
    }


}