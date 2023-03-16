import { Test } from "./test"
export interface ExpectConstructor { }

export type ResultType = boolean | "info" | "warn" //  "error" = false

export class Expect<T> implements ExpectConstructor {
    messengers: { key: keyof Expect<T>, result: ResultType, subject: T, target: T, stack: string }[] = []
    title: string
    subject: T
    test?: Test<any>

    constructor(subject: T, test?: Test<any>)
    constructor(subject: T, title: string, test?: Test<any>)
    constructor(subject: T | Test<any>, title?: string | T, test?: Test<any>) {
        if (arguments.length === 3)
            Object.assign(this, { title, subject, test })
        else
            Object.assign(this, { subject, test: title })
    }

    process(key: keyof Expect<T>, result: ResultType, subject: T, target: T) {
        const { stack } = new Error()
        this.messengers.push({ key, result, subject, target, stack })
    }
    get result() {
        return this.messengers.every(m => m.result)
    }
}

// export const expect = <T>(subject: T) => new Expect(subject, null)

// declare module './test'
// {
//     interface TesterType<T> {
//         (expect: (subject: T) => Expect<T>, subject: T, test: TestFactory, parent: Test<T>): Promise<void> | void
//         (expect: (subject: T, title: string) => Expect<T>, subject: T, test: TestFactory, parent: Test<T>): Promise<void> | void
//     }
// }