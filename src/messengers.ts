import { Expect } from "./expect"
import { Messenger } from "./messenger"

export type Messengers = {
    [key in keyof Expect<any>]: [Messenger<any>]
}
/**
 * default messenger
 */
export const messengers: Messengers = {} as any
