import { Test } from "./test";
export declare class Check {
    modules: Test<any>[];
    test(): Promise<void>;
    report(opts?: {
        head: boolean;
    }): Promise<void>;
    run(opts?: {
        head: boolean;
    }): Promise<void>;
    json(): import("./test").ReportJson[];
}
declare global {
    interface Window {
        chk: Check;
    }
}
