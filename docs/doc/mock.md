# Mock API

The `mock` API allows you to create mock functions and modules for testing purposes. This helps in isolating the code under test and controlling its dependencies. By using mocks, you can simulate the behavior of complex objects and functions, making your tests more predictable and focused.

## Table of Contents

*   [Mock Functions](#mock-functions)
    *   [.mock.instances](#mockinstances)
    *   [.mock.lastCall](#mocklastcall)
    *   [.mockImplementationOnce()](#mockimplementationonce)
    *   [.mockName()](#mockname)
    *   [.mockReturnThis()](#mockreturnthis)
    *   [.mockReturnValue()](#mockreturnvalue)
    *   [.mockReturnValueOnce()](#mockreturnvalueonce)
    *   [.mockResolvedValue()](#mockresolvedvalue)
    *   [.mockResolvedValueOnce()](#mockresolvedvalueonce)
    *   [.mockRejectedValue()](#mockrejectedvalue)
    *   [.mockRejectedValueOnce()](#mockrejectedvalueonce)
    *   [.withImplementation()](#withimplementation)
*   [Mock Modules](#mock-modules)
    *   [`createMockFromModule()`](#createmockfrommodule)
    *   [`mock()`](#mock)

---

## Mock Functions

### .mock.instances

The `.mock.instances` property is an array that stores the `this` value for each call to the mock function. This is particularly useful for testing constructor functions, as it allows you to inspect the objects that were created.

```typescript
test('mockFn.instances', () => {
    const mockFn = fn()
    const a = new (mockFn as any)()
    const b = new (mockFn as any)()
    expect(mockFn.mock.instances[0]).toBe(a)
    expect(mockFn.mock.instances[1]).toBe(b)
})
```

### .mock.lastCall

The `.mock.lastCall` property is an array containing the arguments of the most recent call to the mock function. This is a convenient shortcut for when you only need to inspect the final call.

```typescript
test('mockFn.lastCall', () => {
    const mockFn = fn()
    mockFn(1, 2)
    mockFn(3, 4)
    const a = mockFn.mock.lastCall
    expect(mockFn.mock.lastCall).toEqual([3, 4])
})
```

### .mockImplementationOnce()

The `.mockImplementationOnce()` method allows you to define a custom implementation for a mock function that will only be used for a single call. This is useful for testing functions that behave differently on subsequent calls.

```typescript
test('mockFn.mockImplementationOnce', () => {
    const mockFn = fn(() => 'default')
        .mockImplementationOnce(() => 'first call')
        .mockImplementationOnce(() => 'second call')

    expect(mockFn()).toBe('first call')
    expect(mockFn()).toBe('second call')
    expect(mockFn()).toBe('default')
    expect(mockFn()).toBe('default')
})
```

### .mockName()

The `.mockName()` method sets a custom name for your mock function. This name will be used in test error messages, making it easier to identify which mock function is failing.

```typescript
test('mockFn.mockName, mockReturnThis, mockReturnValue', () => {
    const mockFn = fn().mockName('mockedFunction')
    expect(mockFn).toHaveBeenCalled()
})
```

### .mockReturnThis()

The `.mockReturnThis()` method configures a mock function to return its own `this` context on every call. This is useful for chaining method calls in a fluent API style.

```typescript
test('mockFn.mockName, mockReturnThis, mockReturnValue', () => {
    const obj = {}
    const mockReturnThisFn = fn().mockReturnThis()
    expect(mockReturnThisFn()).toBe(mockReturnThisFn)
})
```

### .mockReturnValue()

The `.mockReturnValue()` method sets a simple return value for a mock function. Every time the mock function is called, it will return this value.

```typescript
test('mockFn.mockName, mockReturnThis, mockReturnValue', () => {
    const mockReturnValueFn = fn().mockReturnValue(42)
    expect(mockReturnValueFn()).toBe(42)
    mockReturnValueFn.mockReturnValue(43)
    expect(mockReturnValueFn()).toBe(43)
})
```

### .mockReturnValueOnce()

The `.mockReturnValueOnce()` method is similar to `.mockReturnValue()`, but it only applies to the next call to the mock function. This is useful for testing functions that return different values on subsequent calls.

```typescript
test('mockFn.mockReturnValueOnce', () => {
    const mockFn = fn()
        .mockReturnValue('default')
        .mockReturnValueOnce('first call')
        .mockReturnValueOnce('second call')

    expect(mockFn()).toBe('first call')
    expect(mockFn()).toBe('second call')
    expect(mockFn()).toBe('default')
    expect(mockFn()).toBe('default')
})
```

### .mockResolvedValue()

The `.mockResolvedValue()` method is used for mocking asynchronous functions. It returns a promise that will resolve with the given value.

```typescript
test('mockFn.mockResolvedValue', async () => {
    const asyncMock = fn().mockResolvedValue(43);
    (await expect(asyncMock()).resolves).toBe(43)
})
```

### .mockResolvedValueOnce()

The `.mockResolvedValueOnce()` method is the asynchronous equivalent of `.mockReturnValueOnce()`. It returns a promise that will resolve with the given value, but only for the next call.

```typescript
test('mockFn.mockResolvedValueOnce', async ({ expect }) => {
    const asyncMock = fn()
        .mockResolvedValue('default')
        .mockResolvedValueOnce('first call')
        .mockResolvedValueOnce('second call');

    (await expect(asyncMock()).resolves).toBe('first call');
    (await expect(asyncMock()).resolves).toBe('second call');
    (await expect(asyncMock()).resolves).toBe('default');
    (await expect(asyncMock()).resolves).toBe('default')
})
```

### .mockRejectedValue()

The `.mockRejectedValue()` method is used for testing error handling in asynchronous code. It returns a promise that will reject with the given error.

```typescript
test('mockFn.mockRejectedValue', async () => {
    const asyncMock = fn()
        .mockRejectedValue(new Error('Async error message'));

    (await expect(asyncMock()).rejects).toThrow('Async error message')
})
```

### .mockRejectedValueOnce()

The `.mockRejectedValueOnce()` method is the asynchronous equivalent of `.mockImplementationOnce()` for rejected promises. It returns a promise that will reject with the given error, but only for the next call.

```typescript
test('mockFn.mockRejectedValueOnce', async ({ expect }) => {
    const asyncMock = fn()
        .mockResolvedValueOnce('first call')
        .mockRejectedValueOnce(new Error('Async error message'));

    (await expect(asyncMock()).resolves).toBe('first call');
    (await expect(asyncMock()).rejects).toThrow('Async error message')
})
```

### .withImplementation()

The `.withImplementation()` method allows you to temporarily change the implementation of a mock function for the duration of a callback. This is useful for testing different scenarios without having to create multiple mock functions.

```typescript
test('mockFn.withImplementation', async ({ expect }) => {
    const mock = fn(() => 'outside callback')

    mock.withImplementation(
        () => 'inside callback',
        () => {
            expect(mock()).toBe('inside callback')
        },
    )

    expect(mock()).toBe('outside callback')

    // Async callback
    await mock.withImplementation(
        () => 'inside async callback',
        async () => {
            expect(mock()).toBe('inside async callback')
        },
    )

    expect(mock()).toBe('outside callback')
})
```

## Mock Modules

### `createMockFromModule()`

The `createMockFromModule()` function creates a mock object from a module, automatically mocking all of its exports. This is useful for creating a baseline mock that you can then customize.

```typescript
const example = createMockFromModule(exampleModule)

test('createMockFromModule should run example code', (/* { expect } */) => {
    // creates a new mocked function with no formal arguments.
    expect(example.function.name).toBe('square')
    expect(example.function).toHaveLength(0)

    // async functions get the same treatment as standard synchronous functions.
    expect(example.asyncFunction.name).toBe('asyncSquare')
    expect(example.asyncFunction).toHaveLength(0)

    // creates a new class with the same interface, member functions and properties are mocked.
    expect(example.class.constructor.name).toBe('Bar')
    expect(example.class.foo.name).toBe('foo')
    expect(example.class.array).toHaveLength(0)

    // creates a deeply cloned version of the original object.
    expect(example.object).toEqual({
        baz: 'foo',
        bar: {
            fiz: 1,
            buzz: [],
        },
    })

    // creates a new empty array, ignoring the original array.
    expect(example.array).toHaveLength(0)

    // creates a new property with the same primitive value as the original property.
    expect(example.number).toBe(123)
    expect(example.string).toBe('baz')
    expect(example.boolean).toBe(true)
    expect(example.symbol).toEqual(Symbol.for('a.b.c'))
})
```

### `mock()`

The `mock()` function allows you to replace a module with a custom mock implementation. This gives you full control over the behavior of the module, allowing you to define its exports and their behavior.

```typescript
test('mock module', () => {

    const mod = mock('../moduleName', () => {
        return fn(() => 42)
    })

    const moduleName = req('../moduleName') as () => number
    expect(moduleName()).toBe(42)
    expect(mod.default).toBeUndefined()

    const { default: moduleName2, foo } = mock('../moduleName', () => {
        return {
            __esModule: true,
            default: fn(() => 42),
            foo: fn(() => 43),
        }
    })

    expect(moduleName2())['==='](42)
    expect(foo())['==='](43)
})
```
