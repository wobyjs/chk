import { DEBUGGER } from 'woby'
import { MyComponent } from './components/components.test'
// import * as sample from './sample.test'
// import * as comps from './components.test'
// import { Chk, Csf } from 'chk'
// import * as example from './example.test'

interface MyComponentProps {
    message: string
    count: number
    timestamp: Date
}


const isDev = typeof import.meta.env !== 'undefined' && import.meta.env.DEV

if (isDev)
    DEBUGGER.test = true

// debugger
export function App() {
    const now = new Date()
    console.log('APP')
    return (
        <div>
            Real page, no test
            <MyComponent class="border m-10" message="World" count={1} timestamp={now} />
            <MyComponent class="border m-10" message="Woby" count={2} timestamp={new Date(new Date(2025, 0, 2, 0, 0, 0, 0))} />

            {/* Components Story Format
            <Csf module={comps} path='components.test' />

            Run test(), see browser debugger console
            <Csf module={sample} /> */}

        </div>
    )
}


// const now = new Date()
// console.log('APP')

{/* <div>
    Explicit test
    <Chk name="MyComponent 1" message="World" count={1} timestamp={new Date()}>
        <MyComponent message="World" count={1} timestamp={new Date()} />
    </Chk>

    <Chk name="MyComponent 2" message="Woby" count={2} timestamp={new Date(2025, 0, 2, 0, 0, 0, 0)}>
        <MyComponent message="Woby" count={2} timestamp={new Date(new Date(2025, 0, 2, 0, 0, 0, 0))} />
    </Chk>
    Components Story Format
    <Csf module={comps} path='components.test' />


    Run test(), see browser debugger console
    <Csf module={sample} />

</div>  */}