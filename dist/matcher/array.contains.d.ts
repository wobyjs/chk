import { Match } from '../match';
declare module '../expect' {
    interface Expect<T> {
        'array.contains': Match<T>;
    }
}
