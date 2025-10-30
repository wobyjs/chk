# Fn API

The `fn` API provides utilities for working with functions, particularly in the context of mocking and spying. It allows you to create mock functions that can be tracked and configured for testing. This is essential for isolating units of code and controlling their behavior during tests.

## Table of Contents

*   [Creating a Mock Function](#creating-a-mock-function)
*   [Mock Function Properties](#mock-function-properties)
    *   [.mock.calls](#mockcalls)
    *   [.mock.instances](#mockinstances)
    *   [.mock.lastCall](#mocklastcall)
*   [Mock Function Configuration](#mock-function-configuration)
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

---

## Creating a Mock Function

You can create a mock function by calling `fn()`. This creates a versatile spy that can track calls, define return values, and mock implementations. It can be used to test how other functions use it, ensuring that the correct arguments are passed and that it is called the expected number of times.

```typescript
function drinkAll<T>(callback: (a: T) => void, flavour: T) {
    if (flavour !== 'octopus') {
        callback(flavour)
    }
}

test('drinkAll', () => {
    test('drinks something lemon-flavoured', ({ }) => {
        const drink = fn()
        drinkAll(drink, 'lemon')
        expect(drink).toHaveBeenCalled()
    })

    test('does not drink something octopus-flavoured', ({ }) => {
        const drink = fn()
        drinkAll(drink, 'octopus')
        expect(drink).not.toHaveBeenCalled()
    })
})

test('drinkEach drinks each drink', () => {
    const drink = fn()
    drink('lemon')
    drink('octopus')
    expect(drink).toHaveBeenCalledTimes(2)
    expect(drink).toHaveBeenCalledTimes(expect.anything)
})

test('toHaveBeenCalledWith', () => {
    const drink = fn()
    drink('lemon', 'juice')
    expect(drink).toHaveBeenCalledWith('lemon', 'juice')
    expect(drink).not.toHaveBeenCalledWith('orange')

    expect(drink).toHaveBeenCalledWith(expect.anything)
    expect(drink).not.toHaveBeenCalledWith(expect.anything)
})

test('toHaveBeenCalledLastCalledWith', () => {
    const drink = fn()
    drink('lemon')
    drink('orange')
    expect(drink).toHaveBeenCalledLastCalledWith('orange')
    expect(drink).not.toHaveBeenCalledLastCalledWith('lemon')

    expect(drink).toHaveBeenCalledLastCalledWith(expect.anything)
    expect(drink).not.toHaveBeenCalledLastCalledWith(expect.anything)
})

test('toHaveBeenCalledNthCalledWith', () => {
    const drink = fn()
    drink('lemon')
    drink('orange')
    drink('apple')
    expect(drink).toHaveBeenCalledNthCalledWith(1, 'lemon')
    expect(drink).toHaveBeenCalledNthCalledWith(2, 'orange')
    expect(drink).not.toHaveBeenCalledNthCalledWith(3, 'lemon')
    expect(drink).not.toHaveBeenCalledNthCalledWith(3, expect.anything)
})

test('toHaveReturnedTimes', () => {
    const func = fn()
    func()
    func()
    expect(func).toHaveReturnedTimes(2)
    expect(func).not.toHaveReturnedTimes(1)
    expect(func).toHaveReturnedTimes(expect.anything)
    expect(func).not.toHaveReturnedTimes(expect.anything)
})

test('toHaveReturnedWith', () => {
    const func = fn(() => 'lemon')
    func()
    expect(func).toHaveReturnedWith('lemon')
    expect(func).not.toHaveReturnedWith('orange')
    expect(func).toHaveReturnedWith(expect.anything)
    expect(func).not.toHaveReturnedWith(expect.anything)
})

test('toHaveLastReturnedWith', () => {
    let callCount = 0
    const func = fn(() => {
        callCount++
        if (callCount === 1) return 'lemon'
        if (callCount === 2) return 'orange'
    })

    func()
    func()
    expect(func).toHaveLastReturnedWith('orange')
    expect(func).not.toHaveLastReturnedWith('lemon')
    expect(func).toHaveLastReturnedWith(expect.anything)
    expect(func).not.toHaveLastReturnedWith(expect.anything)
})

test('toHaveNthReturnedWith', () => {
    let callCount = 0
    const func = fn(() => {
        callCount++
        if (callCount === 1) return 'lemon'
        if (callCount === 2) return 'orange'
        if (callCount === 3) return 'apple'
    })

    func()
    func()
    func()
    expect(func).toHaveNthReturnedWith(1, 'lemon')
    expect(func).toHaveNthReturnedWith(2, 'orange')
    expect(func).toHaveNthReturnedWith(3, 'apple')
    expect(func).not.toHaveNthReturnedWith(3, expect.anything)
})

test('drink returns La Croix', () => {
    const beverage = { name: 'La Croix', toString }
    const drink = fn((beverage: { name: string }) => beverage.name)

    drink(beverage)

    expect(drink).toHaveReturnedWith('La Croix')
})

test('map calls its argument with a non-null argument', () => {
    const mock = fn();
    [1].map(x => mock(x))
    expect(mock).toHaveBeenCalledWith(expect.anything)
})

class Cat { }

function getCat(fn: <T>(t: T) => T) {
    return fn(new Cat())
}

test('randocall calls its callback with a class instance', () => {
    const mock = fn()
    getCat(mock)
    expect(mock).toHaveBeenCalledWith(expect.any(Cat))
})

function randocall(fn: <T>(t: T) => T) {
    return fn(Math.floor(Math.random() * 6 + 1))
}

test('randocall calls its callback with a number', () => {
    const mock = fn()
    randocall(mock)
    expect(mock).toHaveBeenCalledWith(expect.any(Number))
})
```

## Mock Function Properties

### .mock.calls

The `.mock.calls` property is an array that stores the arguments for every call that has been made to the mock function. Each element in the array is itself an array of the arguments for a specific call. This is useful for inspecting the full history of calls to a function.

```typescript
// Example: (not directly in sample.test.ts, but implied by other call assertions)
const mockFn = fn();
mockFn(1, 2);
mockFn(3);
expect(mockFn.mock.calls).toEqual([[1, 2], [3]]);
```

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

## Mock Function Configuration

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
