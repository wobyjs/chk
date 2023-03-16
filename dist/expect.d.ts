import { Test } from "./test";
export interface ExpectConstructor {
}
export declare type ResultType = boolean | "info" | "warn";
export declare class Expect<T> implements ExpectConstructor {
    messengers: {
        key: keyof Expect<T>;
        result: ResultType;
        subject: T;
        target: T;
        stack: string;
    }[];
    title: string;
    subject: T;
    test?: Test<any>;
    constructor(subject: T, test?: Test<any>);
    constructor(subject: T, title: string, test?: Test<any>);
    process(key: keyof Expect<T>, result: ResultType, subject: T, target: T): void;
    get result(): boolean;
}
