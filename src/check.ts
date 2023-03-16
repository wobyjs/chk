import { Test } from "./test"

export class Check {
    modules = [] as Test<any>[]

    async test() {
        const now = +new Date()

        const { modules } = this
        const p: Promise<void>[] = []
        modules.forEach(l => p.push(l.test()))
        await Promise.all(p)
        console.log(`%c TEST %c ${(+new Date() - now) / 1000} ms`, 'border: 1px solid gray;font-weight:bold;background-color:yellow', '')
    }

    async report(opts = { head: false }) {
        const now = +new Date()

        const { modules } = this
        const p: Promise<void>[] = []
        modules.forEach(l => p.push(l.report(opts)))
        await Promise.all(p)

        console.log(`%c REPORT %c ${(+new Date() - now) / 1000} ms`, 'border: 1px solid gray;font-weight:bold;background-color:yellow', '')
    }

    async run(opts = { head: false }) {
        await this.test()
        await this.report(opts)
    }
    json() {
        return this.modules.map(m => m.json())
    }
}


declare global {
    interface Window {
        chk: Check
    }
}

window.chk = new Check()