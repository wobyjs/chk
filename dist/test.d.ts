import { Check } from "./check";
import { Expect, ResultType } from "./expect";
declare type ExpectType = <S>(subject: S, title?: string) => Expect<S>;
export interface TesterType<T> {
    (env: {
        expect: ExpectType;
        subject: T;
        test: TestFactory;
        parent: Test<T>;
    }): Promise<void> | void;
}
export interface TestOptions<T> {
    prefix?: string;
    surfix?: string;
    formatter?: (subject: T) => string;
}
export interface Result {
    key: string;
    result: ResultType;
    subject: any;
    target: string;
    line: string;
    title: string;
}
export interface Tests {
    result: boolean;
    title: string;
    line: string;
    modules: Module[];
}
export interface Module {
    title: string;
    result: boolean;
    tests?: Tests;
    expects?: Result[];
}
export interface ReportJson {
    result: boolean;
    title: string;
    line: string;
    modules: Module[];
}
export declare class Test<T> {
    modules: (Test<any> | Expect<any>)[];
    subject: T;
    title: string;
    func: TesterType<T>;
    options: TestOptions<T>;
    parent: Test<any> | Check;
    stack: string;
    constructor(title: string);
    constructor(subject: T, options: TestOptions<T>, func: TesterType<T>);
    constructor(title: string, func: TesterType<T>);
    get result(): boolean;
    test(): Promise<void>;
    /**
     * @param head excludes expect report in report
     *
     *  */
    report(opts?: {
        head: boolean;
    }): Promise<void>;
    /** await r
     * un() before call this */
    json(): ReportJson;
}
export interface TestFactory {
    <T>(title: string): Test<T>;
    <T>(subject: T, options: TestOptions<T>, func: TesterType<T>): Test<T>;
    <T>(title: string, func: TesterType<T>): Test<T>;
    <T>(titleOrSubject: T | string, opt?: TestOptions<T> | TesterType<T>, func?: TesterType<T>): Test<T>;
}
export declare const test: TestFactory;
export {};
