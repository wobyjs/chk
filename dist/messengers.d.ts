import { Expect } from "./expect";
import { Messenger } from "./messenger";
export declare type Messengers = {
    [key in keyof Expect<any>]: [Messenger<any>];
};
/**
 * default messenger
 */
export declare const messengers: Messengers;
