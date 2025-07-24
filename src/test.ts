/**
 * @file Implements the `Test` class, which represents an individual test suite or a single test case within the `verifies` testing framework.
 * It provides the structure for defining tests, running expectations, and reporting results.
 */

import { $, Stack } from "woby"
import { Verifies } from "./verifies"
import { Expect } from "./expect"
import { binary } from "./messenger/console/binary"
import { check } from './messenger/console/check'
import { TesterType, TestOptions, ReportJson, TestFactory } from "./types"
import * as SS from "soby"
import { TESTCONTEXT_SYMBOL } from "./testContext"
import { binds } from "./bind"
import { imp, req } from "./mock"
import { loc } from "./messenger/console/loc"


if (!window.verifies)
    window.verifies = new Verifies()

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
    parent!: Test<any> | Verifies
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
    public async test() {
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
            SS.context({ [TESTCONTEXT_SYMBOL]: ctx }, async () => {
                const p = this.func(ctx)

                if (typeof p === 'object' && typeof p.then === 'function') {
                    await p
                    this.tested(Math.random())
                }

                for (const e of modules) {
                    if (e instanceof Test) {
                        await e.test()
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
     * @param opts Options for the report, such as whether to include the head (summary).
     */
    public async report(opts = { head: false }) {
        const { modules } = this
        const { head } = opts

        const f = async () => {
            const { result, title, stack } = this
            // let g = result ? console.groupCollapsed : console.group
            let code = stack.stack.split('\n')
            loc(check(result, null, null, [title, `[${modules.length}]`]), result, async ({ log }) => {

                log(code[4] ?? code[3])

                for (const e of modules) {
                    if (!head && e instanceof Expect) {
                        e.messengers.forEach(m => {
                            const { key, result, subject, target, stack } = m
                            const { title } = e

                            let [msg, ...fmt] = binary(key)(result, subject, target)
                            if (title) {
                                msg = `%c${title} ${msg}%c`
                                fmt = ['', ...fmt, '']
                            }

                            // g = result ? console.groupCollapsed : console.group

                            loc(check(result, subject, target, [msg, ...fmt]), !!result, ({ log }) => {
                                const line = stack.split('\n')[4] ?? stack.split('\n')[3]
                                // return [[`%c${line.trim()}`, 'text-align: right']]
                                log(`%c${line.trim()}`, 'text-align: right')
                            })
                            // console.groupEnd()
                        })
                    }
                    else if (e instanceof Test) {
                        await e.report(opts)
                    }
                }
            })
        }

        await f()
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
 * A factory function for creating a `Test` instance and adding it to the global `window.verifies` object.
 * This is the primary way to define new test suites or test cases.
 * @template T The type of the subject or context for the test.
 * @param titleOrSubject The title of the test or the subject under test.
 * @param opt Optional: Either `TestOptions` or the test function `TesterType`.
 * @param func Optional: The test function `TesterType`.
 * @returns The newly created `Test` instance.
 */
export const test: TestFactory = <T>(titleOrSubject: T | string, opt?: TestOptions<T> | TesterType<T>, func?: TesterType<T | string>) => {
    const test = !!func ? new Test(titleOrSubject, opt as any, func) : (!!opt ? new Test(titleOrSubject as any, opt as any) : new Test(titleOrSubject as any))
    test.parent = window.verifies
    window.verifies.modules.push(test)
    return test
}