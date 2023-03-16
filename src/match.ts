import { Expect } from "./expect"

export interface Match<T> {
    (subject: T): Expect<T>
}

export interface Matcher { }
