/**
 * @file Defines the core types and interfaces used throughout the `verifies` testing framework.
 * This includes types for test contexts, expectation functions, test options, and report structures.
 */

import { Expect, ResultType } from "./expect"
import type { Test } from "./test"
import * as ext from './expect.static'
import { createMockFromModule } from "./createMockFromModule"

/**
 * Represents the context available within a test function.
 * @template T The type of the subject being tested in the current context.
 */
export type TextContext<T> = {
    /** The `expect` function, augmented with static matchers. */
    expect: ExpectType & typeof ext
    /** The subject value currently under test. */
    subject: T
    /** A factory function for creating nested tests. */
    test: TestFactory
    /** The parent `Test` instance of the current context. */
    parent: Test<T>
    /** A function to import mocked modules. */
    require: ReturnType<typeof createMockFromModule>
    /** A function to import mocked modules (alias for `require`). */
    import: ReturnType<typeof createMockFromModule>
}

/**
 * Unwraps a Promise type, returning the resolved type.
 * If the input is not a Promise, it returns the input type as is.
 * @template T The type to unwrap.
 */
export type Unpromise<T> = T extends Promise<infer U> ? U : T

/**
 * Defines the type for the `expect` function, which creates an `Expect` instance for a given subject.
 * @template S The type of the subject being tested.
 * @param subject The value or object to be tested.
 * @param title An optional title for the expectation.
 * @returns An `Expect` instance.
 */
export type ExpectType = <S>(subject: S, title?: string) => Expect<S>

/**
 * Defines the type for a tester function, which contains the logic for a test.
 * @template T The type of the subject being tested.
 * @param env An environment object containing:
 *   - `expect`: A function to create expectations.
 *   - `subject`: The subject of the test.
 *   - `test`: A factory function to create nested tests.
 *   - `parent`: The parent `Test` instance.
 */
export interface TesterType<T> {
    (env: /* { expect: ExpectType & typeof ext; subject: T; test: TestFactory; parent: Test<T> } & */ TextContext<T>): Promise<void> | void
}

/**
 * Defines the options for a `Test`, allowing customization of the test title.
 * @template T The type of the subject being tested.
 */
export interface TestOptions<T> {
    /** An optional prefix to add to the test title. */
    prefix?: string
    /** An optional suffix to add to the test title. */
    surfix?: string
    /** A formatter function to customize how the subject is displayed in the test title. */
    formatter?: (subject: T) => string
    /** An optional flag to hide location information in the test report. */
    noLocation?: boolean
}

/**
 * Represents the detailed result of a single expectation within a test.
 */
export interface Result {
    /** The key or name of the matcher used (e.g., "toEqual", "toBe"). */
    key: string
    /** The outcome of the expectation (`true` for pass, `false` for fail, "info", "warn"). */
    result: ResultType
    /** The actual value that was asserted. */
    subject: any
    /** The expected value against which the subject was compared. */
    target: string
    /** The line number in the source code where the expectation was defined. */
    line: string
    /** An optional title or description for the expectation. */
    title: string
}

/**
 * Represents a collection of tests and their results, typically a test suite.
 */
export interface Tests {
    /** The overall result of the test suite (`true` if all nested tests pass, `false` otherwise). */
    result: boolean
    /** The title of the test suite. */
    title: string
    /** The line number in the source code where the test suite was defined. */
    line: string
    /** An array of nested test modules. */
    modules: Module[]
}

/**
 * Represents a test module, which can contain nested tests or a list of expectations.
 */
export interface Module {
    /** The title of the module. */
    title: string
    /** The overall result of the module. */
    result: boolean
    /** Optional: Nested test suites within this module. */
    tests?: Tests
    /** Optional: Individual expectations within this module. */
    expects?: Result[]
}

/**
 * Represents the JSON structure of a complete test report.
 */
export interface ReportJson {
    /** The overall result of the entire test run. */
    result: boolean
    /** The title of the top-level test suite. */
    title: string
    /** The line number in the source code where the top-level test suite was defined. */
    line: string
    /** An array of top-level test modules. */
    modules: Module[]
}

/**
 * Defines the interface for a factory function that creates `Test` instances.
 * This interface supports multiple overloads for creating tests with different parameters.
 */
export interface TestFactory {
    /**
     * Creates a `Test` instance with only a title.
     * @template T The type of the subject or context for the test.
     * @param title The title of the test.
     * @returns A new `Test` instance.
     */
    <T>(title: string): Test<T>
    /**
     * Creates a `Test` instance with a subject, options, and a test function.
     * @template T The type of the subject being tested.
     * @param subject The subject under test.
     * @param options Configuration options for the test.
     * @param func The test function containing assertions.
     * @returns A new `Test` instance.
     */
    <T>(subject: T, options: TestOptions<T>, func: TesterType<T>): Test<T>
    /**
     * Creates a `Test` instance with a title and a test function.
     * @template T The type of the subject being tested.
     * @param title The title of the test.
     * @param func The test function containing assertions.
     * @returns A new `Test` instance.
     */
    <T>(title: string, func: TesterType<T>): Test<T>
    /**
     * Creates a `Test` instance with a title or subject, and optional test options or a test function.
     * This is a general overload to cover various test creation scenarios.
     * @template T The type of the subject or context for the test.
     * @param titleOrSubject The title of the test or the subject under test.
     * @param opt Optional: Either `TestOptions` or the test function `TesterType`.
     * @param func Optional: The test function `TesterType`.
     * @returns A new `Test` instance.
     */
    <T>(titleOrSubject: T | string, opt?: TestOptions<T> | TesterType<T>, func?: TesterType<T>): Test<T>
}