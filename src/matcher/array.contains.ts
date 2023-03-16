import { Expect } from '../expect'
import { Match } from '../match'
import { messengers } from '../messengers'
import { binary } from '../messenger/console/binary'

declare module '../expect' {
    interface Expect<T> {
        'array.contains': Match<T>
    }
}

Expect.prototype['array.contains'] = function <T extends []>(this: Expect<T>, target: T) {
    const { subject } = this
    this.process('array.contains', target.every(i => subject.includes(i)), subject, target)
    return this
}


