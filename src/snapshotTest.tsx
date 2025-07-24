/**
 * @file Implements the `SnapshotTest` class, a specialized test type for managing and comparing UI snapshots.
 * This class extends the base `Test` class to provide functionality for loading, saving, and comparing rendered component outputs.
 */

import { Test } from './test'
import { areDeeplyEqual } from './utils' // Import the new utility function
import { Expect } from './expect' // Import Expect to create assertions
import { loadSnapshot, saveSnapshot } from './browserSnapshot'
import { $, Stack } from 'woby'

/**
 * Defines the structure of a snapshot file, which contains the props and output of a component for a given state.
 */
interface SnapshotContent {
    /** The serialized props of the component at the time the snapshot was taken. */
    props: any
    /** The HTML output of the component at the time the snapshot was taken. */
    output: string
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
        this.currentOutput = currentOutput

    }

    /**
     * Executes the snapshot test. This involves loading any existing snapshot, comparing it with the current output,
     * and updating the test result based on the comparison.
     * If no snapshot exists, it creates a new one.
     */
    public async test() {
        this.modules = []

        const loadedSnapshot = await loadSnapshot(this.snapshotName)
        if (loadedSnapshot) {
            this.expectedSnapshot = {
                props: loadedSnapshot.props,
                output: loadedSnapshot.html,
            }
        }

        this.loadedSnapshot(this.expectedSnapshot?.output ?? <div class='font-bold text-orange-400'>Saving initial snapshot</div>)

        // Create an Expect instance to manage the result of the snapshot comparison
        const snapshotExpect = new Expect<string>(this.currentOutput, `Snapshot for '${this.snapshotName}'`, this)
        this.modules.push(snapshotExpect) // Add it to the test's modules

        if (!this.expectedSnapshot) {
            // No existing snapshot, so this is a new snapshot.
            snapshotExpect.process('newSnapshot', true, this.currentOutput, 'No existing snapshot')
            console.log(`%c[SnapshotTest] No existing snapshot for '${this.snapshotName}'. New snapshot created.`, 'color: orange; font-weight: bold;')
            await this.save()
            this.loadedSnapshot(this.expectedSnapshot?.output ?? <div class='font-bold text-orange-400'>Saving initial snapshot. Done...</div>)
            return
        }

        // Compare current props with snapshot props
        const propsMatch = areDeeplyEqual(this.currentProps, this.expectedSnapshot.props)
        // Compare current output with snapshot output
        const outputMatch = areDeeplyEqual(this.currentOutput, this.expectedSnapshot.output)

        const overallMatch = propsMatch && outputMatch

        if (!overallMatch) {
            snapshotExpect.process('mismatch', false, this.currentOutput, this.expectedSnapshot.output)
            // console.log(`%c[SnapshotTest] Snapshot mismatch for '${this.snapshotName}'!`, 'color: red; font-weight: bold;')
        } else {
            snapshotExpect.process('match', true, this.currentOutput, this.expectedSnapshot.output)
            // console.log(`%c[SnapshotTest] Snapshot for '${this.snapshotName}' matches.`, 'color: green; font-weight: bold;')
        }
        const r = this.result

        this.tested(Math.random())
    }

    /**
     * Saves the current component's props and rendered output as a new snapshot.
     * This is typically called when a snapshot test fails and the new output is accepted as the correct one.
     */
    async save() {
        await saveSnapshot(this.snapshotName, this.currentProps, this.currentOutput)
        await this.test()
    }

    // /**
    //  * Overrides the default report method to provide snapshot-specific reporting.
    //  * @param opts Options for the report.
    //  */
    // public async report(opts = { head: false }) {
    //     // console.log(`[SnapshotTest] Reporting for '${this.snapshotName}': Result = ${this.result}`)
    //     if (!this.result) {
    //         console.log("Expected Props:", this.expectedSnapshot?.props)
    //         console.log("Actual Props:", this.currentProps)
    //         console.log("Expected Output:", this.expectedSnapshot?.output)
    //         console.log("Actual Output:", this.currentOutput)
    //     }
    //     await super.report(opts)
    // }
}