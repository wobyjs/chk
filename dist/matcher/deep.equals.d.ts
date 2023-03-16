import { Match } from '../match';
declare module '../expect' {
    interface Expect<T> {
        '===': Match<T>;
        /** deep equals */
        deq: Match<T>;
    }
}
