import { customElement, DEBUGGER } from "woby"
import 'chk/index.css'
import '../index.css'
import 'chk'

DEBUGGER.debug = true

// Example component test file
export const MyComponent2 = ({ message, count, timestamp = new Date(), isActive = false }: {
    message: string
    count: number
    timestamp: Date
    isActive?: boolean
}) => {
    return (
        <div class={`my-component p-4 border rounded-lg shadow-md ${isActive ? 'bg-green-100 border-green-500' : 'bg-gray-100 border-gray-300'}`}>
            <h1 class="text-2xl font-bold mb-2">Enhanced Component</h1>
            <p class="mb-1">Message: <strong class="text-purple-600">{message}</strong></p>
            <p class="mb-1">Count: <span class="count font-bold text-red-500">{count}</span></p>
            <p class="mb-1">Timestamp: <em class="text-gray-500">{timestamp.toString()}</em></p>
            <p>Status: <span class={isActive ? 'text-green-600 font-bold' : 'text-gray-600'}>{isActive ? 'Active' : 'Inactive'}</span></p>
        </div>
    )
}

customElement('my-component2', MyComponent2, 'message')