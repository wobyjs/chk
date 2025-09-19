// Example component test file
export const MyComponent = ({ message, count, timestamp }: {
    message: string
    count: number
    timestamp: Date
}) => {
    return (
        <div class="my-component">
            <h1>My Component</h1>
            <p>Message: {message}</p>
            <p>Count: {count}</p>
            <p>Timestamp: {timestamp?.toString()}</p>
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