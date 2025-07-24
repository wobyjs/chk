/**
 * @file Defines the `Expect` class, which is central to the `chk` testing framework's assertion mechanism.
 * An `Expect` instance wraps a subject value and provides a fluent interface for applying various matchers (assertions).
 */

import { PromiseMaybe } from "../../woby/dist/types/soby"
import { Test } from "./test"

/**
 * A marker interface for the `Expect` class constructor.
 */
export interface ExpectConstructor { }

/**
 * Defines the possible types for a test result.
 * - `boolean`: `true` for success, `false` for failure.
 * - `"info"`: For informational messages that are not assertions.
 * - `"warn"`: For warnings that do not necessarily fail the test.
 */
export type ResultType = boolean | "info" | "warn" //  "error" = false

/**
 * The `Expect` class provides a fluent API for making assertions in tests.
 * It holds the subject value and collects the results of applied matchers.
 * @template T The type of the subject value being asserted.
 */
export class Expect<T> implements ExpectConstructor {
    /**
     * An array to store the results and details of each matcher applied to the subject.
     * Each entry includes the matcher key, result, subject, target, and a stack trace.
     */
    messengers: { key: string, result: ResultType, subject: T, target: T, stack: string }[] = []
    /**
     * An optional title or description for this specific expectation.
     */
    title!: string
    /**
     * The value or promise of a value that is being asserted.
     */
    subject!: PromiseMaybe<T>
    /**
     * A reference to the parent `Test` instance, if this expectation is part of a larger test.
     */
    test?: Test<any>

    /**
     * Overload: Constructs an `Expect` instance with a subject and an optional parent test.
     * @param subject The value to be asserted.
     * @param test Optional: The parent `Test` instance.
     */
    constructor(subject: T, test?: Test<any>)
    /**
     * Overload: Constructs an `Expect` instance with a subject, a title, and an optional parent test.
     * @param subject The value to be asserted.
     * @param title A descriptive title for this expectation.
     * @param test Optional: The parent `Test` instance.
     */
    constructor(subject: T, title: string, test?: Test<any>)
    constructor(subject: T | Test<any>, title?: string | T, test?: Test<any>) {
        if (arguments.length === 3)
            Object.assign(this, { title, subject, test })
        else
            Object.assign(this, { subject, test: title })
    }

    /**
     * Records the result of a matcher application.
     * This method is called internally by the matchers to store their outcome.
     * @param key The identifier of the matcher that was applied (e.g., "toEqual", "toBe").
     * @param result The boolean result of the assertion (`true` for pass, `false` for fail).
     * @param subject The actual value that was asserted.
     * @param target The expected value against which the subject was compared.
     */
    process(key: string, result: ResultType, subject: T, target: T) {
        const { stack } = new Error()
        this.messengers.push({ key, result, subject, target, stack: stack || '' })
    }

    /**
     * Gets the overall result of this expectation.
     * An expectation passes only if all applied matchers (messengers) have a `true` result.
     * @returns `true` if all assertions passed, `false` otherwise.
     */
    get result() {
        return this.messengers.every(m => m.result)
    }
}

// Remove the module augmentation for './expect' to avoid circular type issues and build errors
// If you need to extend Expect, do it in a separate file or via interface merging elsewhere

// export const expect = <T>(subject: T) => new Expect(subject, null)

// declare module './test'
// {
//     interface TesterType<T> {
//         (expect: (subject: T) => Expect<T>, subject: T, test: TestFactory, parent: Test<T>): Promise<void> | void
//         (expect: (subject: T, title: string) => Expect<T>, subject: T, test: TestFactory, parent: Test<T>): Promise<void> | void
//     }
// }