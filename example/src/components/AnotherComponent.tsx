import { customElement, DEBUGGER } from "woby"

// Example component test file
export const AnotherComponent = () => {
    return (
        <div class="p-4 border rounded-lg shadow-md bg-blue-50">
            <h2 class="text-xl font-bold text-blue-800 mb-2">Another Component</h2>
            <p class="text-blue-600">This is another component</p>
        </div>
    )
}

customElement('another-component', AnotherComponent)