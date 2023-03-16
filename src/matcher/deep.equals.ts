import { Expect } from '../expect'
import { Match } from '../match'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        '===': Match<T>
        /** deep equals */
        deq: Match<T>
    }
}

Expect.prototype.deq =
    Expect.prototype['==='] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        this.process('===', subject === target, subject, target)
        return this
    }

messengers.deq = messengers['==='] = [binary('===')]
