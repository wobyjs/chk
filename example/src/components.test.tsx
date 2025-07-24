export function Hello({ name }: { name: string }) {
    return <div>Hello, {name}!</div>
}


export interface MyComponentProps {
    message: string
    count: number
    timestamp: Date
}

export function MyComponent({ timestamp = new Date(), ...props }: MyComponentProps) {
    return (
        <div>
            <h1>Hello, {props.message}!</h1>
            <p>Count: {props.count}</p>
            <p>Timestamp: {timestamp.toISOString()}</p>
            <button>Click Me</button>
        </div>
    )
}


// describe('Hello component', () => {
//     it('renders with name', () => {
//         // In a real test, you would render and snapshot
//         const el = <Hello name="World" />
//         // expect(el).toMatchSnapshot() // To be implemented
//     })
// })
