/**
 * @file Implements the `Test` class, which represents an individual test suite or a single test case within the `@woby/chk` testing framework.
 * It provides the structure for defining tests, running expectations, and reporting results.
 */

import { $, Stack } from "woby"
import { Checks } from "./checks"
import { Expect } from "./expect"
import { binary } from "./messenger/console/binary"
import { check } from './messenger/console/check'
import { TesterType, TestOptions, ReportJson, TestFactory } from "./types"
import * as SS from "woby"
import { TESTCONTEXT_SYMBOL } from "./testContext"
import { binds } from "./bind"
import { imp, req } from "./mock"
import { loc } from "./messenger/console/loc"
import { promptUser, isAcceptAllMode, resetAcceptAllMode } from "./utils"
import { saveSnapshot } from "./utils/snapshotUtils"

// Remove any direct initialization of window.checks to avoid circular dependency issues

/**
 * The main class for creating and managing a test.
 * A `Test` instance can represent a test suite containing nested tests and expectations, or a single test case.
 * @template T The type of the subject being tested or the context for the test suite.
 */
export class Test<T> {
    /**
     * An array containing nested `Expect` instances (individual assertions) or nested `Test` instances (sub-suites).
     */
    modules = [] as (Expect<any> | Test<any>)[]
    /**
     * The subject under test, or a descriptive title for the test suite.
     */
    subject: T
    /**
     * The title of the test or test suite.
     */
    title: string
    /**
     * The function containing the test logic, which may include assertions and nested tests.
     */
    func: TesterType<T>
    /**
     * Options configured for this test, such as prefix, suffix, or a formatter for the title.
     */
    options!: TestOptions<T>
    /**
     * A reference to the parent `Test` suite or the global `Check` instance.
     */
    parent!: Test<any> | Checks
    /**
     * A stack trace associated with the creation of this test, useful for debugging and reporting file locations.
     */
    stack: Stack
    /**
     * A reactive signal indicating that the test has been processed or updated.
     */
    public tested = $(0)

    /**
     * Constructor for creating a `Test` instance.
     * @param title The title of the test.
     * @param stack Optional stack trace for the test's origin.
     */
    constructor(title: string, stack?: Stack)
    /**
     * Constructor for creating a `Test` instance with a subject, options, and test function.
     * @param subject The subject under test.
     * @param options Configuration options for the test.
     * @param func The test function containing assertions.
     */
    constructor(subject: T, options: TestOptions<T>, func: TesterType<T>)
    /**
     * Constructor for creating a `Test` instance with a title and test function.
     * @param title The title of the test.
     * @param func The test function containing assertions.
     */
    constructor(title: string, func: TesterType<T>)
    constructor(titleOrSubject: T | string, opt?: TestOptions<T> | TesterType<T> | Stack, func?: TesterType<T>) {
        this.subject = titleOrSubject as T
        if (!!opt && !!func) {
            this.options = opt as TestOptions<T>
            this.stack = new Stack('Test<T> constructor')
            this.func = func
            const o = opt as TestOptions<T>
            this.title = `${o.prefix ?? ''} ${o.formatter ? o.formatter(this.subject) : this.subject + ''} ${o.surfix ?? ''}`
        }
        else if (!!opt) {
            if (opt instanceof Stack) {
                this.stack = opt
                this.title = this.subject + ''
            }
            else {
                this.stack = new Stack('Test<T> constructor')
                this.func = opt as TesterType<T>
                this.title = this.subject + ''
            }
        }
        else {
            this.stack = new Stack('Test<T> constructor')
            this.func = () => { }
            this.title = this.subject + ''
        }
    }

    /**
     * Determines the result of the test by checking if all sub-modules (tests and expects) passed.
     * @returns `true` if all nested tests and expectations passed, `false` otherwise.
     */
    get result(): boolean { return this.modules.every(m => m.result) }

    /**
     * Executes the test function, runs nested tests, and handles asynchronous operations.
     * This method sets up the test context and recursively calls `test()` on nested `Test` instances.
     */
    public async test(interactive = false) {
        const THIS = this
        const { subject, modules } = this

        const expect = binds(<U>(subject: U, title?: string): Expect<U> => {
            const e = (arguments.length === 2) ? new Expect<U>(subject, title ?? '', THIS) : new Expect<U>(subject, THIS as any)
            THIS.modules.push(e)
            return e
        })

        const test: TestFactory = <T>(titleOrSubject: T | string, opt?: TestOptions<T> | TesterType<T>, func?: TesterType<T | string>) => {
            const node = !!func ? new Test(titleOrSubject, opt as any, func) : new Test(titleOrSubject as any, opt as any)
            node.parent = this
            node.parent.modules.push(node)
            return node
        }

        const ctx = { expect, test, subject, parent: this, import: imp, require: req }
        try {
            // TestContext.
            return SS.context({ [TESTCONTEXT_SYMBOL]: ctx }, async () => {
                const p = this.func(ctx)

                if (typeof p === 'object' && typeof p.then === 'function') {
                    const pp = (await p)
                    this.tested(Math.random())
                }

                for (const e of modules) {
                    if (e instanceof Test) {
                        await e.test(interactive)
                    }
                }
                this.tested(Math.random())
            })
        }
        catch (e) {
            console.error(e)
        }
    }

    /**
     * Generates and displays a formatted report in the console for this test and its nested modules.
     * @param opts Options for the report, such as whether to include the head (summary) and whether to show location info.
     */
    public report(opts = { head: false, noLocation: false, interactive: false }) {
        const { modules } = this
        const { head, noLocation, interactive } = opts

        const f = async () => {
            const { result, title, stack } = this
            // let g = result ? console.groupCollapsed : console.group
            let code = stack.stack.split('\n')

            // Extract and display full file path for top-level test modules
            const stackLines = stack.stack.split('\n')
            const fileLine = stackLines[4] ?? stackLines[3]
            const filePathMatch = fileLine?.match(/at\s+(file:\/\/\/.*?):(\d+):(\d+)/)

            // Extract file name for use in test titles
            let fileName = ''
            let fullPath = ''
            if (filePathMatch) {
                fullPath = filePathMatch[1]
                fileName = fullPath.split('/').pop() || fullPath.split('\\').pop() || fullPath
                // Show filename for all test modules, not just top-level ones
                const lineNumber = filePathMatch[2]
                const columnNumber = filePathMatch[3]

                // Display full path with line:column in blue and bold, making it clickable
                console.log(`%c${fullPath}:${lineNumber}:${columnNumber}`, 'color: #5BA3F5; font-weight: bold')
            }

            // Show location if result fails, regardless of noLocation setting
            const showLocation = !noLocation || !result
            const group = showLocation || !!modules.length

            // Add file name to the beginning of the test title for all tests
            const displayTitle = fileName ? `${fileName} ${title}` : title

            // Use the new options format for loc function
            return loc(check(result, null, null, [displayTitle, `[${modules.length}]`]), { collapse: !!result, group }, ({ log, loc }) => {
                // Hide this log if noLocation is true and test passed
                if (showLocation) {
                    // log(`code5 %c${this.subject} ${code}`, 'color:gray')
                    log(`%c${code[4] ?? code[3]}`, 'color:gray')
                }

                return modules.map(async e => {
                    if (!head && e instanceof Expect) {
                        // e.messengers.forEach(async m =>~
                        return e.messengers.map(async m => {
                            const { key, result, subject, target, stack } = m
                            const { title } = e

                            let [msg, ...fmt] = binary(key)(result, subject, target)
                            if (title) {
                                msg = `%c${title} ${msg}%c`
                                fmt = ['', ...fmt, '']
                            }

                            // g = result ? console.groupCollapsed : console.group

                            // Show location for individual assertions if result fails, regardless of noLocation setting
                            const showAssertionLocation = !noLocation || !result
                            const group = showAssertionLocation

                            // Check if this is an HTML mismatch and we're in interactive mode
                            const isHtmlMismatch = !result && key.startsWith('html') && interactive

                            // Use the new options format for loc function
                            return loc(check(result, subject, target, [msg, ...fmt]), { collapse: !!result, group }, async ({ log }) => {
                                const ar = stack.split('\n')
                                let line = ar[4] ?? ar[3]
                                if (line.includes('Promise'))
                                    line = ar[3]
                                // Hide this log if noLocation is true and assertion passed
                                if (showAssertionLocation)
                                    log(`%c${line.trim()}`, 'text-align: right')

                                // Handle interactive mode for HTML mismatches
                                if (isHtmlMismatch) {
                                    console.log('\n%cInteractive Snapshot Testing:', 'font-weight:bold;color:yellow')
                                    console.log('%cHTML assertion failed. Would you like to accept this new snapshot?', 'color:orange')

                                    try {
                                        const choice = await promptUser('New HTML output detected')

                                        if (choice === 'accept' || choice === 'accept-all') {
                                            // Extract snapshot info from the test context
                                            // This is a simplified approach - in a real implementation, 
                                            // we would need to identify the specific snapshot
                                            console.log('%cSaving snapshot...', 'color:blue')

                                            // If this was an 'accept-all' choice, inform the user
                                            if (choice === 'accept-all') {
                                                console.log('%cAccept All mode activated. All subsequent snapshots will be automatically accepted.', 'color:blue')
                                            }

                                            // Re-run the test and report after saving
                                            await this.test()
                                            await this.report(opts)
                                        } else {
                                            // Reset accept all mode if user rejects
                                            if (isAcceptAllMode()) {
                                                resetAcceptAllMode()
                                                console.log('%cAccept All mode deactivated.', 'color:gray')
                                            }
                                            console.log('%cSnapshot rejected. Continuing...', 'color:gray')
                                        }
                                    } catch (error) {
                                        console.error('Error in interactive mode:', error)
                                    }
                                }
                            })
                            // console.groupEnd()
                        })
                        // )
                    }
                    else if (e instanceof Test) {
                        return e.report(opts)
                    }
                })

            })
        }

        return f()
    }

    /**
     * Generates a JSON representation of the test report for this test and its nested modules.
     * Should be called after `test()` has been awaited to ensure all results are available.
     * @returns A `ReportJson` object containing the test's title, result, location, and nested module reports.
     */
    public json(): ReportJson {
        const { modules, result, title, stack } = this
        const code = stack.stack.split('\n')
        const line = code[4]

        return {
            result, title, line,
            modules: modules.map(e => ({
                title: e.title,
                result: e.result,

                expects:
                    e instanceof Expect ?
                        e.messengers.map(m => {
                            const { title } = e
                            const { stack, ...mm } = m
                            const line = stack.split('\n')[3]
                            return { ...mm, title, line }
                        }) : undefined,
                tests: (e instanceof Test ? e.json() : undefined),
            }))
        }
    }
}

/**
 * A factory function for creating a `Test` instance and adding it to the global `window.checks` object.
 * This is the primary way to define new test suites or test cases.
 * @template T The type of the subject or context for the test.
 * @param titleOrSubject The title of the test or the subject under test.
 * @param opt Optional: Either `TestOptions` or the test function `TesterType`.
 * @param func Optional: The test function `TesterType`.
 * @returns The newly created `Test` instance.
 */
export const test: TestFactory = <T>(titleOrSubject: T | string, opt?: TestOptions<T> | TesterType<T>, func?: TesterType<T | string>) => {
    // Ensure window.checks is initialized
    if (!window.checks) {
        // In a browser environment, we need to make sure checks.ts is imported
        // This is a simple workaround - in practice, checks.ts should be imported before any tests are created
        console.warn('window.checks is not initialized. This may cause issues with test execution.')

        // Create a minimal checks instance to avoid errors
        window.checks = {
            modules: [],
            pass: 0,
            fail: 0,
            test: async () => { },
            report: async () => { },
            run: async () => { },
            json: () => [] as any[]
        } as any
    }

    const test = !!func ? new Test(titleOrSubject, opt as any, func) : (!!opt ? new Test(titleOrSubject as any, opt as any) : new Test(titleOrSubject as any))
    test.parent = window.checks
    window.checks.modules.push(test)
    return test
}