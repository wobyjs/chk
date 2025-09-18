/**
 * @file Implements the `Check` class, which serves as the core test runner and reporter for the `@woby/chk` testing framework.
 * It orchestrates the execution of test modules and generates reports based on their outcomes.
 */

import { type Test } from "./test"
import { type Expect } from "./expect"

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
    public async test() {
        const now = +new Date()

        const { modules } = this
        await Promise.all(modules.map(async l => await l.test()))

        console.log(`%c TEST %c ${(+new Date() - now) / 1000} ms`, 'border: 1px solid gray;font-weight:bold;background-color:yellow', '')
    }

    /**
     * Generates reports for all registered test modules.
     * Measures and logs the total time taken for report generation.
     * @param opts Options for reporting, e.g., `head` to control report display.
     */
    async report(opts = { head: false, noLocation: false }) {
        const now = +new Date()

        // Reset counters
        this.pass = 0
        this.fail = 0

        const { modules } = this
        await Promise.all(modules.map(async l => await l.report(opts)))

        // Accumulate pass/fail counts from all modules
        modules.forEach(module => {
            this.accumulateResults(module)
        })

        console.log(`%c REPORT %c ${(+new Date() - now) / 1000} ms`, 'border: 1px solid gray;font-weight:bold;background-color:yellow', '')
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
     * Runs both the test execution and report generation phases sequentially.
     * @param opts Options to be passed to the `report` method.
     */
    async run(opts = { head: false, noLocation: false }) {
        await this.test()
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
    }
}

// Initialize the global `checks` instance if it doesn't already exist.
if (!window.checks)
    window.checks = new Checks()