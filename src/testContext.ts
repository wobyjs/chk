/**
 * @file Manages the test context within the `verifies` testing framework.
 * This file defines the symbol used to access the test context and provides `expect` and `test` functions
 * that are context-aware, allowing them to interact with the current test suite.
 */

import { ExpectType, TesterType, TestFactory, TestOptions, TextContext } from "./types"
import * as SS from "soby"
import { test as Test } from './test'
import { binds } from "./bind"
import type * as ext from './expect.static'

/**
 * A unique symbol used to identify and access the test context within the `soby` context management system.
 */
export const TESTCONTEXT_SYMBOL = Symbol("TEST_CTX")

/**
 * A context-aware `expect` function that retrieves the current test context and delegates the expectation creation.
 * This function is bound to the current test context, ensuring that expectations are correctly associated with their parent test.
 * 
 * If called outside of a test context (e.g., directly in a promise without proper wrapping),
 * it will log an error to the console.
 * 
 * @template T The type of the subject being expected.
 * @param subject The value to be asserted.
 * @param title Optional: A descriptive title for the expectation.
 * @returns An `Expect` instance with chained matchers.
 */
export const expect = binds((<T>(subject: T, title?: string) => {
    const ctx = (SS.context(TESTCONTEXT_SYMBOL) as TextContext<T>) as TextContext<T>

    // if (isPromise(subject)) {
    if (!ctx) {
        const s = new Error().stack.split('\n')
        console.error('expect context not accessible inside promise, please use  test("title", async ({ expect }) => ...', s[2])
    }

    //     return SS.context({ [TESTCONTEXT_SYMBOL]: ctx }, async () => {
    //         return (ctx.expect)(subject, title)
    //     })
    // }

    return (ctx.expect)(subject, title)

})) as ExpectType & typeof ext

/**
 * A context-aware `test` function that retrieves the current test context and delegates the test creation.
 * This allows for nested test suites to be correctly associated with their parent test.
 * 
 * If called outside of a test context, it will default to the global `Test` factory.
 * 
 * @template T The type of the subject or context for the test.
 * @param titleOrSubject The title of the test or the subject under test.
 * @param opt Optional: Either `TestOptions` or the test function `TesterType`.
 * @param func Optional: The test function `TesterType`.
 * @returns The newly created `Test` instance.
 */
export const test: TestFactory = <T>(titleOrSubject: T | string, opt?: TestOptions<T> | TesterType<T>, func?: TesterType<T>) => {
    const ctx = (SS.context(TESTCONTEXT_SYMBOL) as TextContext<T>) as TextContext<T>
    // if (!ctx) {
    //     const s = new Error().stack.split('\n')
    //     console.error('test context not accessible inside promise, please use  test("title", async ({ expect }) => ...', s[2])
    // }

    return (ctx?.test ?? Test)(titleOrSubject, opt, func)
}