import { Match } from '../match';
declare module '../expect' {
    interface Expect<T> {
        '>': Match<T>;
        greaterThan: Match<T>;
    }
}
