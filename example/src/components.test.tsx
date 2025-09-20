// Example component test file
export const MyComponent = ({ message, count, timestamp = new Date() }: {
    message: string
    count: number
    timestamp: Date
}) => {
    return (
        <div class="my-component">
            <h1>My Component</h1>
            <p>Message: {message}</p>
            <p>Count: {count}</p>
            <p>Timestamp: {timestamp.toString()}</p>
        </div>
    )
}

export const AnotherComponent = () => {
    return (
        <div>
            <h2>Another Component</h2>
            <p>This is another component</p>
        </div>
    )
}

export const MyComponent2 = ({ message, count, timestamp = new Date(), isActive = false }: {
    message: string
    count: number
    timestamp: Date
    isActive?: boolean
}) => {
    return (
        <div class={`my-component ${isActive ? 'active' : ''}`}>
            <h1>Enhanced Component</h1>
            <p>Message: <strong>{message}</strong></p>
            <p>Count: <span class="count">{count}</span></p>
            <p>Timestamp: <em>{timestamp.toString()}</em></p>
            <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
        </div>
    )
}
