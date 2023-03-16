import { ResultType } from '../../expect'
import { Messenger } from '../../messenger'

export const check: Messenger<string> =
    <T>(result: ResultType, subject: T, target: T, previousMessage = [] as string[]) => {
        const [h, ...tail] = previousMessage
        const args = [`%c${result ? '✓' : '✗'} %c${h}`, result ? 'color:green' : 'color:red', ''].concat(tail.length > 0 ? tail : [""])
        // console.log(...args)
        return args
    }
