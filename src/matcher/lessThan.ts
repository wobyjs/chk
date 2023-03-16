import { Expect } from '../expect'
import { Match } from '../match'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        '<': Match<T>
        lessThan: Match<T>
    }
}

Expect.prototype.lessThan =
    Expect.prototype['<'] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        this.process('<', subject < target, subject, target)
        return this
    }

messengers.lessThan = messengers['<'] = [binary('<')]
