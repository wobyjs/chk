/**
 * @file Implements the `Check` class, which serves as the core test runner and reporter for the `@woby/chk` testing framework.
 * It orchestrates the execution of test modules and generates reports based on their outcomes.
 */

import { type Test } from "./test"
import { type Expect } from "./expect"
import { SnapshotTest } from "./snapshotTest"
import { resetAcceptAllMode } from "./utils"

/**
 * The `Check` class manages and executes a collection of test modules.
 * It provides methods for running tests, generating reports, and accessing test results.
 */
export class Checks {
    /**
     * An array to store registered test modules.
     * Each module is an instance of `Test`.
     */
    modules = [] as Test<any>[]
    pass = 0
    fail = 0

    /**
     * Executes all registered test modules.
     * Measures and logs the total time taken for test execution.
     */
    public async test(interactive = false) {
        const now = +new Date()

        const { modules } = this
        // Run tests sequentially in interactive mode to prevent concurrent prompts
        if (interactive) {
            for (const l of modules) {
                if (l instanceof SnapshotTest) {
                    await l.test(interactive)
                } else {
                    await l.test()
                }
            }
        } else {
            // Run tests concurrently in non-interactive mode for better performance
            await Promise.all(modules.map(async l => {
                if (l instanceof SnapshotTest) {
                    await l.test(interactive)
                } else {
                    await l.test()
                }
            }))
        }

        console.log(`%c TEST %c ${(+new Date() - now) / 1000} ms`, 'border: 1px solid gray;font-weight:bold;background-color:yellow', '')
    }

    /**
     * Generates reports for all registered test modules.
     * Measures and logs the total time taken for report generation.
     * @param opts Options for reporting, e.g., `head` to control report display.
     */
    async report(opts = { head: false, noLocation: false, interactive: false }) {
        const now = +new Date()

        // Reset counters
        this.pass = 0
        this.fail = 0

        const { modules } = this
        // Run reports sequentially in interactive mode to prevent concurrent prompts
        if (opts.interactive) {
            for (const l of modules) {
                await l.report(opts)
            }
        } else {
            // Run reports concurrently in non-interactive mode for better performance
            await Promise.all(modules.map(async l => await l.report(opts)))
        }

        // Accumulate pass/fail counts from all modules
        modules.forEach(module => {
            this.accumulateResults(module)
        })

        console.log(`%c REPORT %c ${(+new Date() - now) / 1000} ms`, 'border: 1px solid gray;font-weight:bold;background-color:yellow', '')
    }

    /**
     * Runs both the test execution and report generation phases sequentially.
     * @param opts Options to be passed to the `report` method.
     */
    async run(opts = { head: false, noLocation: false, interactive: false }) {
        // Reset the accept all mode at the beginning of each test run
        resetAcceptAllMode()

        await this.test(opts.interactive)
        await this.report(opts)

        // Log the pass/fail counts with colorful output
        const passCount = window.checks.pass
        const failCount = window.checks.fail

        // Colorful output for test results
        console.log('\n')
        console.log(
            `%c📊 Test Results: %c${passCount} %cpassed%c, %c${failCount} %cfailed`,
            'font-weight:bold',
            'color:#D5FF9E;font-weight:bold',
            'color:#D5FF9E',
            'color:default',
            'color:#FA7C7A;font-weight:bold',
            'color:#FA7C7A'
        )

        // Show a summary message with color based on results
        if (failCount === 0) {
            console.log("%c🎉 All tests completed successfully!", 'color:#D5FF9E;font-weight:bold')
        } else {
            console.log(
                `%c⚠️ Tests completed with ${failCount} failure${failCount > 1 ? 's' : ''}`,
                'color:orange;font-weight:bold'
            )
        }
    }

    /**
     * Recursively accumulates pass/fail counts from a test module and its nested modules.
     * @param module The test module to accumulate results from.
     */
    private accumulateResults(module: Test<any>) {
        // Count expectations in this module
        module.modules.forEach(subModule => {
            if ('messengers' in subModule) {
                // For expectations, count each messenger (assertion)
                const expectModule = subModule as Expect<any>
                expectModule.messengers.forEach(messenger => {
                    if (messenger.result === true) {
                        this.pass++
                    } else if (messenger.result === false) {
                        this.fail++
                    }
                    // "info" and "warn" results are not counted as pass/fail
                })
            } else if ('modules' in subModule) {
                // For nested tests, recursively accumulate their results
                this.accumulateResults(subModule as Test<any>)
            }
        })
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
 * Extends the global `Window` interface to include a `checks` property.
 * This allows the `Check` instance to be globally accessible in a browser environment.
 */
declare global {
    interface Window {
        /**
         * The global instance of the `Check` test runner.
         */
        checks: Checks
        isDeno: boolean
    }
}

// Initialize the global `checks` instance if it doesn't already exist.
// Ensure this initialization happens regardless of module import order
if (typeof window !== 'undefined' && !window.checks) {
    window.checks = new Checks()
}
