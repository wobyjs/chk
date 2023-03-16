import { format } from '../../utils'
import { Messenger } from '../../messenger'
import { ResultType } from '../../expect'

export const binary = (operator: string): Messenger<string> =>
    <T>(result: ResultType, subject: T, target: T, previousMessage?: string[]) => {
        const color = result ? 'color:green' : 'color:red'
        return [`%c${format(subject)} %c${operator} %c${format(target)}%c`, color, 'font-weight:bold', color, '']
    }