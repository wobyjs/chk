import { Check } from "./check"
import { Expect, ResultType } from "./expect"
import { binary } from "./messenger/console/binary"
import { check } from './messenger/console/check'

type ExpectType = <S>(subject: S, title?: string) => Expect<S>
export interface TesterType<T> {
    (env: { expect: ExpectType, subject: T, test: TestFactory, parent: Test<T> }): Promise<void> | void
}

export interface TestOptions<T> {
    prefix?: string, surfix?: string, formatter?: (subject: T) => string
}

export interface Result {
    key: string
    result: ResultType
    subject: any
    target: string
    line: string
    title: string
}

export interface Tests {
    result: boolean
    title: string
    line: string
    modules: Module[]
}

export interface Module {
    title: string
    result: boolean
    tests?: Tests
    expects?: Result[]
}

export interface ReportJson {
    result: boolean
    title: string
    line: string
    modules: Module[]
}


export class Test<T> {
    // modules = new Map<Expect<any> | Test<any>, { node: Expect<any> | Test<any>, result?: boolean/* , message?: string */ }>()
    modules = [] as (Expect<any> | Test<any>)[]
    subject: T
    title: string
    func: TesterType<T>
    options: TestOptions<T>
    parent: Test<any> | Check
    stack: string = new Error().stack

    constructor(title: string)
    constructor(subject: T, options: TestOptions<T>, func: TesterType<T>)
    constructor(title: string, func: TesterType<T>)
    constructor(titleOrSubject: T | string, opt?: TestOptions<T> | TesterType<T>, func?: TesterType<T>) {
        this.subject = titleOrSubject as T
        if (!!opt && !!func) {
            this.options = opt as TestOptions<T>
            this.func = func
            const o = opt as TestOptions<T>
            this.title = `${o.prefix ?? ''} ${o.formatter ? o.formatter(this.subject) : this.subject + ''} ${o.surfix ?? ''}`
        }
        else if (!!opt) {
            this.func = opt as TesterType<T>
            this.title = this.subject + ''
        }
        else {
            this.func = () => { }
            this.title = this.subject + ''
        }
    }
    get result(): boolean { return this.modules.every(m => m.result) }

    public async test(/* opts = { async: false } */) {
        const THIS = this
        const { subject, modules } = this
        function expect<U>(subject: U, title?: string): Expect<U> {
            const e = (arguments.length === 2) ? new Expect<U>(subject, title, THIS) : new Expect<U>(subject, THIS as any)
            // modules.set(e, { node: e })
            THIS.modules.push(e)
            return e
        }

        const test: TestFactory = <T>(titleOrSubject: T | string, opt?: TestOptions<T> | TesterType<T>, func?: TesterType<T | string>) => {
            const node = !!func ? new Test(titleOrSubject, opt as any, func) : new Test(titleOrSubject as any, opt as any)
            node.parent = this
            // node.parent.modules.set(node, { node })
            node.parent.modules.push(node)
            return node
        }

        try {
            const p = this.func({ expect, subject, test, parent: this })

            if (typeof p === 'object' && typeof p.then === 'function')
                await p

            modules.forEach(async e => {
                if (e instanceof Expect) {
                }
                else if (e instanceof Test) {
                    await e.test(/* opts */)
                }
            })
        }
        catch (e) {
            console.error(e)
        }
    }

    /**
     * @param head excludes expect report in report
     * 
     *  */
    public async report(opts = { head: false }) {
        const { modules } = this
        const { head } = opts

        const f = async () => {
            const { result, title, stack } = this
            let g = result ? console.groupCollapsed : console.group
            let code = stack.split('\n')
            g(...check(result, null, null, [title]))
            console.log(code[4])
            // g(`%c${title}%c`, 'font-weight:bold', '')
            modules.forEach(async e => {
                if (!head && e instanceof Expect) {
                    e.messengers.forEach(m => {
                        const { key, result, subject, target, stack } = m
                        const { title } = e

                        // line = line.substring(line.indexOf(' (') + 1)

                        let [msg, ...fmt] = binary(key)(result, subject, target)
                        if (title) {
                            msg = `%c${title} ${msg}%c`
                            fmt = [/* 'font-weight:bold' */'', ...fmt, '']
                        }
                        // else {
                        //     msg = `${msg}%c`
                        //     fmt = [...fmt, 'text-align: right', '']
                        // }
                        g = result ? console.groupCollapsed : console.group

                        g(...check(result, subject, target, [msg, ...fmt]))
                        const line = stack.split('\n')[3]
                        console.log(`%c${line.trim()}`, 'text-align: right')
                        console.groupEnd()
                    })
                }
                else if (e instanceof Test) {
                    await e.report(opts)
                }

            })
            console.groupEnd()
        }

        await f()
    }

    /** await r
     * un() before call this */
    public json(): ReportJson {
        const { modules, result, title, stack } = this
        const code = stack.split('\n')
        const line = code[4]

        return {
            result, title, line,
            modules: modules.map(e => ({
                title: e.title,
                result: e.result,

                expects: e instanceof Expect ?
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

export interface TestFactory {
    <T>(title: string): Test<T>
    <T>(subject: T, options: TestOptions<T>, func: TesterType<T>): Test<T>
    <T>(title: string, func: TesterType<T>): Test<T>
    <T>(titleOrSubject: T | string, opt?: TestOptions<T> | TesterType<T>, func?: TesterType<T>): Test<T>
}
export const test: TestFactory = <T>(titleOrSubject: T | string, opt?: TestOptions<T> | TesterType<T>, func?: TesterType<T | string>) => {
    const test = !!func ? new Test(titleOrSubject, opt as any, func) : (!!opt ? new Test(titleOrSubject as any, opt as any) : new Test(titleOrSubject as any))
    test.parent = window.chk
    window.chk.modules.push(test)
    return test
}

// export function test<T>(subject: T, options: TestOptions<T>, func: TesterType<T> )
// export function test<T>(title: string, func: TesterType<T> )
// export function test<T>(titleOrSubject: T | string, opt: TestOptions<T> | TesterType<T> , func?: TesterType<T> ) {
//     return new Test(titleOrSubject, opt as any, func)
// }

// test("", (e, s, test, p) => {
//     test("test", ee => { ee('') })
// })