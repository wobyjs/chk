import { Match } from '../match';
declare module '../expect' {
    interface Expect<T> {
        '$': Match<string>;
        setTitle: Match<string>;
    }
}
