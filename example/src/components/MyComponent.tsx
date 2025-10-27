import { $, customElement, DEBUGGER, defaults } from "woby"
import '@woby/chk/index.css'
import '../index.css'
import '@woby/chk'
import { ObservableMaybe } from "../../../../woby/dist/types"

DEBUGGER.debug = true

// Example component test file
export const MyComponent = defaults(() => ({
    timestamp: new Date(),
    message: $('') as ObservableMaybe<string> | undefined,
    count: $(0), class: $('')
}), ({ message, count, timestamp, class: cls }: {
    message: string
    count: number
    timestamp: Date
    class?: JSX.Class
}) => {
    return (
        <div class={["my-component p-4 border rounded-lg shadow-md bg-white", cls]}>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">My Component</h1>
            <p class="text-gray-600 mb-1">Message: <span class="font-medium">{message}</span></p>
            <p class="text-gray-600 mb-1">Count: <span class="font-medium">{count}</span></p>
            <p class="text-gray-600">Timestamp: <span class="font-medium">{timestamp.toString()}</span></p>
        </div>
    )
})

customElement('my-component', MyComponent)