/**
 * @file Implements the `Check` class, which serves as the core test runner and reporter for the `verifies` testing framework.
 * It orchestrates the execution of test modules and generates reports based on their outcomes.
 */

import { type Test } from "./test"

/**
 * The `Check` class manages and executes a collection of test modules.
 * It provides methods for running tests, generating reports, and accessing test results.
 */
export class Verifies {
    /**
     * An array to store registered test modules.
     * Each module is an instance of `Test`.
     */
    modules = [] as Test<any>[]

    /**
     * Executes all registered test modules.
     * Measures and logs the total time taken for test execution.
     */
    async test() {
        const now = +new Date()

        const { modules } = this
        const p: Promise<void>[] = []
        modules.forEach(l => p.push(l.test()))
        await Promise.all(p)
        console.log(`%c TEST %c ${(+new Date() - now) / 1000} ms`, 'border: 1px solid gray;font-weight:bold;background-color:yellow', '')
    }

    /**
     * Generates reports for all registered test modules.
     * Measures and logs the total time taken for report generation.
     * @param opts Options for reporting, e.g., `head` to control report display.
     */
    async report(opts = { head: false }) {
        const now = +new Date()

        const { modules } = this
        const p: Promise<void>[] = []
        modules.forEach(l => p.push(l.report(opts)))
        await Promise.all(p)

        console.log(`%c REPORT %c ${(+new Date() - now) / 1000} ms`, 'border: 1px solid gray;font-weight:bold;background-color:yellow', '')
    }

    /**
     * Runs both the test execution and report generation phases sequentially.
     * @param opts Options to be passed to the `report` method.
     */
    async run(opts = { head: false }) {
        await this.test()
        await this.report(opts)
    }

    /**
     * Returns a JSON representation of the test results from all modules.
     * @returns An array of JSON objects, each representing the results of a test module.
     */
    json() {
        return this.modules.map(m => m.json())
    }
}

/**
 * Extends the global `Window` interface to include a `verifies` property.
 * This allows the `Check` instance to be globally accessible in a browser environment.
 */
declare global {
    interface Window {
        /**
         * The global instance of the `Check` test runner.
         */
        verifies: Verifies
    }
}

// Initialize the global `verifies` instance if it doesn't already exist.
if (!window.verifies)
    window.verifies = new Verifies()