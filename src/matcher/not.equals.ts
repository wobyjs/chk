import { Expect } from '../expect'
import { Match } from '../match'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        '!=': Match<T>
        neq: Match<T>
    }
}

Expect.prototype.neq =
    Expect.prototype['!='] = function <T>(this: Expect<T>, target: T) {
        const { subject } = this
        this.process('!=', subject != target, subject, target)
        return this
    }


messengers.neq = messengers['!='] = [binary('!=')]
