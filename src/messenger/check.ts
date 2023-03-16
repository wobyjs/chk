import { ResultType } from '../expect'
import { Messenger } from '../messenger'

export const check: Messenger<string> =
    <T>(result: ResultType, subject: T, target: T, previousMessage?: string[]) => [`${result ? '✓' : '✗'} ${previousMessage.join(' ')}`]
