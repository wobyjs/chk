import { Expect } from '../expect'
import { Match } from '../match'

declare module '../expect' {
    interface Expect<T> {
        '$': Match<string>
        setTitle: Match<string>
    }
}

Expect.prototype.setTitle =
    Expect.prototype.$ = function <T>(this: Expect<T>, target: string) {
        const { subject } = this
        this.title = target
        return this
    }

