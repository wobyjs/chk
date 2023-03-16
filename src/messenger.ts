import { ResultType } from './expect'

export interface Messenger<R> {
    <T>(result: ResultType, subject: T, target: T, previousMessage?: R[]): R[]
}
