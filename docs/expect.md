# Expect API

The `expect` API is the cornerstone of writing effective tests in `chk`. It provides a fluent and intuitive interface for making assertions about values, allowing you to verify that your code behaves as expected. By chaining `expect()` with various matcher functions, you can express a wide range of conditions and validate the state, behavior, and output of your application. This API is designed to be highly readable and expressive, making your tests clear and easy to understand.

## Table of Contents

*   [.toBe()](#tobe)
*   [.toEqual()](#toequal)
*   [.not](#not)
*   [.resolves](#resolves)
*   [.rejects](#rejects)
*   [.toHaveBeenCalled()](#tohavebeencalled)
*   [.toHaveBeenCalledTimes()](#tohavebeencalledtimes)
*   [.toHaveBeenCalledWith()](#tohavebeencalledwith)
*   [.toHaveBeenCalledLastCalledWith()](#tohavebeencalledlastcalledwith)
*   [.toHaveBeenCalledNthCalledWith()](#tohavebeencallednthcalledwith)
*   [.toHaveReturnedTimes()](#tohavereturnedtimes)
*   [.toHaveReturnedWith()](#tohavereturnedwith)
*   [.toHaveLastReturnedWith()](#tohavelastreturnedwith)
*   [.toHaveNthReturnedWith()](#tohaventhreturnedwith)
*   [.toHaveLength()](#tohavelength)
*   [.toHaveProperty()](#tohaveproperty)
*   [.toBeCloseTo()](#tobecloseto)
*   [.toBeDefined()](#tobedefined)
*   [.toBeFalsy()](#tobefalsy)
*   [.toBeTruthy()](#tobetruthy)
*   [.toBeInstanceOf()](#tobeinstanceof)
*   [Numeric Comparisons](#numeric-comparisons)
    *   [.toBeGreaterThan()](#tobegreaterthan)
    *   [.toBeGreaterThanOrEqual()](#tobegreaterthanorequal)
    *   [.toBeLessThan()](#tobelessthan)
    *   [.toBeLessThanOrEqual()](#tobelessthanorequal)
    *   [Comparison Operators (>, >=, <, <=)](#comparison-operators)
*   [.toBeNull()](#tobenuil)
*   [.toBeUndefined()](#tobeundefined)
*   [.toBeNaN()](#tobenan)
*   [.toContain()](#tocontain)
*   [.toContainEqual()](#tocontainequal)
*   [.toMatch()](#tomatch)
*   [.toMatchObject()](#tomatchobject)
*   [.toStrictEqual()](#tostrictequal)
*   [.toBeOneOf()](#tobeoneof)
*   [.toBeTypeOf()](#tobetypeof)
*   [.toHaveResolved()](#tohaveresolved)
*   [.toHaveResolvedTimes()](#tohaveresolvedtimes)
*   [.toHaveResolvedWith()](#tohaveresolvedwith)
*   [.toHaveLastResolvedWith()](#tohavelastresolvedwith)
*   [.toHaveNthResolvedWith()](#tohaventhresolvedwith)
*   [.toSatisfy()](#tosatisfy)
*   [.toThrow()](#tothrow)
*   [Static Matchers](#static-matchers)
    *   [`expect.anything`](#expectanything)
    *   [`expect.any(Constructor)`](#expectanyconstructor)

---

### .toBe()

The `.toBe()` matcher is used to test for strict equality. It compares values using the `===` operator, meaning both the value and the type must be the same for the assertion to pass. This matcher is ideal for primitive values like numbers, strings, and booleans, as well as for checking if two variables reference the exact same object in memory.

```typescript
test('Sample 1', {}, ({ }) => {
    expect(1 + 1)["==="](2)
    expect(1 + 10)["==="](expect.anything)
})

test('Sample 2', {}, ({ }) => {
    const a = { b: 1 }
    expect(a.b)["==="](1)
    expect((a as any).c)["==="](expect.anything)
})

test('Sample 3 fail', {}, ({ }) => {
    const a = { b: 1 }
    expect(a.b)["==="](2) //fail case
})

test('mockFn.instances', () => {
    const mockFn = fn()
    const a = new (mockFn as any)()
    const b = new (mockFn as any)()
    expect(mockFn.mock.instances[0]).toBe(a)
    expect(mockFn.mock.instances[1]).toBe(b)
})

test('mockFn.mockImplementationOnce', () => {
    const mockFn = fn(() => 'default')
        .mockImplementationOnce(() => 'first call')
        .mockImplementationOnce(() => 'second call')

    expect(mockFn()).toBe('first call')
    expect(mockFn()).toBe('second call')
    expect(mockFn()).toBe('default')
    expect(mockFn()).toBe('default')
})

test('mockFn.mockName, mockReturnThis, mockReturnValue', () => {
    const mockFn = fn().mockName('mockedFunction')
    expect(mockFn).toHaveBeenCalled()

    const obj = {}
    const mockReturnThisFn = fn().mockReturnThis()
    expect(mockReturnThisFn()).toBe(mockReturnThisFn)

    const mockReturnValueFn = fn().mockReturnValue(42)
    expect(mockReturnValueFn()).toBe(42)
    mockReturnValueFn.mockReturnValue(43)
    expect(mockReturnValueFn()).toBe(43)
})

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

test('mockFn.mockResolvedValue', async () => {
    const asyncMock = fn().mockResolvedValue(43);
    (await expect(asyncMock()).resolves).toBe(43)
})

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

test('spy function resolved a value', async ({ expect }) => {
    const getApplesPrice = async (amount: number) => amount * 10 // Simplified for testing
    const getPriceSpy = fn(getApplesPrice)

    const price = await getPriceSpy(10)

    expect(price).toBe(100)
    expect(getPriceSpy).toHaveResolved()
})

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

    // creates a new property with the same primitive value as the original property.
    expect(example.number).toBe(123)
    expect(example.string).toBe('baz')
    expect(example.boolean).toBe(true)
})

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

test('plays video', () => {

    const video = {
        // it's a getter!
        get play() {
            return true
        },
    }
    const spy = spyOn(video, 'play', 'get') // we pass 'get'
    const isPlaying = video.play

    expect(spy).toHaveBeenCalled()
    expect(isPlaying).toBe(true)
})
```

### .toEqual()

The `.toEqual()` matcher is used for deep equality comparison, particularly useful for objects and arrays. Unlike `.toBe()`, which checks for strict identity, `.toEqual()` recursively checks the properties of objects and elements of arrays to ensure they have the same values. This allows you to compare complex data structures without worrying about whether they are the exact same instance in memory.

```typescript
test('Sample Test', ({ }) => {
    test({ a: 1, b: 2, toString: () => '{ a: 1, b: 2,}' }, {}, ({ subject }) => {
        expect(subject.a)["==="](1)
        expect(subject.b)["==="](2)
    })
})

test('mockFn.lastCall', () => {
    const mockFn = fn()
    mockFn(1, 2)
    mockFn(3, 4)
    const a = mockFn.mock.lastCall
    expect(mockFn.mock.lastCall).toEqual([3, 4])
})

test('toEqual', () => {
    expect({ a: 1, b: 2, toString }).toEqual({ a: 1, b: 2, toString })
    expect([1, 2, 3]).toEqual([1, 2, 3])
    expect({ a: 1, b: 2 }).not.toEqual({ a: 1, b: 3 })
})

test('createMockFromModule should run example code', (/* { expect } */) => {
    // creates a deeply cloned version of the original object.
    expect(example.object).toEqual({
        baz: 'foo',
        bar: {
            fiz: 1,
            buzz: [],
        },
    })

    // creates a new property with the same primitive value as the original property.
    expect(example.symbol).toEqual(Symbol.for('a.b.c'))
})
```

### .not

The `.not` modifier allows you to negate the result of any subsequent matcher. This is useful for asserting that a condition is false, providing a clear and readable way to express negative assertions in your tests.

```typescript
test('Sample 4 not', {}, ({ }) => {
    expect(1).not.eq(2)
    expect(1).not.eq(1) // This should fail
    expect(1).not.eq(expect.anything)
})

test('Async operations', ({ expect }) => {
    test('resolves', async ({ }) => { // use expect here, becaulse lost in await 2nd
        (await expect(Promise.resolve('lemon')).resolves).not.toBe('octopus');
        (await expect(Promise.resolve('lemon')).resolves).not.toBe(expect.anything)
    })

    test('rejects', async ({ }) => { // use expect here, becaulse lost in await 2nd
        (await expect(Promise.reject(new Error('octopus'))).rejects).not.toThrow('lemon');
        (await expect(Promise.reject(new Error('octopus'))).rejects).not.toThrow(expect.anything)
    })
})

test('drinkAll', () => {
    test('does not drink something octopus-flavoured', ({ }) => {
        const drink = fn()
        drinkAll(drink, 'octopus')
        expect(drink).not.toHaveBeenCalled()
    })
})

test('toHaveBeenCalledWith', () => {
    const drink = fn()
    drink('lemon', 'juice')
    expect(drink).not.toHaveBeenCalledWith('orange')
    expect(drink).not.toHaveBeenCalledWith(expect.anything)
})

test('toHaveBeenCalledLastCalledWith', () => {
    const drink = fn()
    drink('lemon')
    drink('orange')
    expect(drink).not.toHaveBeenCalledLastCalledWith('lemon')
    expect(drink).not.toHaveBeenCalledLastCalledWith(expect.anything)
})

test('toHaveBeenCalledNthCalledWith', () => {
    const drink = fn()
    drink('lemon')
    drink('orange')
    drink('apple')
    expect(drink).not.toHaveBeenCalledNthCalledWith(3, 'lemon')
    expect(drink).not.toHaveBeenCalledNthCalledWith(3, expect.anything)
})

test('toHaveReturnedTimes', () => {
    const func = fn()
    func()
    func()
    expect(func).not.toHaveReturnedTimes(1)
    expect(func).not.toHaveReturnedTimes(expect.anything)
})

test('toHaveReturnedWith', () => {
    const func = fn(() => 'lemon')
    func()
    expect(func).not.toHaveReturnedWith('orange')
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
    expect(func).not.toHaveLastReturnedWith('lemon')
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
    expect(func).not.toHaveNthReturnedWith(3, expect.anything)
})

test('toHaveLength', () => {
    expect([]).not.toHaveLength(1)
})

test('toHaveProperty', () => {
    const obj = { a: 1, b: 'hello', toString }
    expect(obj).not.toHaveProperty('c')
    expect(obj).not.toHaveProperty('a', 2)
})

test('toBeCloseTo', () => {
    expect(0.1 + 0.2).not.toBeCloseTo(0.3, 10) //fail case
})

test('toBeDefined', () => {
    const y: any = undefined
    expect(y).not.toBeDefined()
})

test('toBeFalsy', () => {
    expect(true).not.toBeFalsy()
})

test('toBeTruthy', () => {
    expect(false).not.toBeTruthy()
})

test('toBeInstanceOf', () => {
    expect({}).not.toBeInstanceOf(Array)
    expect({}).not.toBeInstanceOf(expect.anything)
})

test('numeric comparisons', () => {
    expect(10).not.toBeGreaterThan(15)
    expect(10).not.toBeGreaterThanOrEqual(11)
    expect(15).not.toBeLessThan(10)
    expect(10).not.toBeLessThanOrEqual(9)
})

test('toBeNull', () => {
    expect(undefined).not.toBeNull()
    expect(0).not.toBeNull()
})

test('toBeUndefined', () => {
    expect(null).not.toBeUndefined()
    expect(0).not.toBeUndefined()
})

test('toBeNaN', () => {
    expect(0).not.toBeNaN()
    expect('abc').not.toBeNaN() //fail case
})

test('toContain', () => {
    expect([1, 2, 3]).not.toContain(4)
    expect('hello world').not.toContain('foo')
    expect([1, 2, 3]).not.toContain(anything)
})

test('toContainEqual', () => {
    const arr = [{ a: 1, toString }, { b: 2, toString }]
    expect(arr).not.toContainEqual({ c: 3, toString })
})

test('toEqual', () => {
    expect({ a: 1, b: 2 }).not.toEqual({ a: 1, b: 3 })
})

test('toMatch', () => {
    expect('hello world').not.toMatch(/foo/)
})

test('toMatchObject', () => {
    const obj = { a: 1, b: { c: 2, d: 3, toString }, toString }
    expect(obj).not.toMatchObject({ a: 2, toString })
    expect(obj).not.toMatchObject({ b: { e: 4, toString }, toString })
})

test('toStrictEqual', () => {
    class Foo { constructor(public a: number) { } toString() { return JSON.stringify(this) } }
    expect({ a: 1, b: 2, toString }).not.toStrictEqual({ a: 1, b: '2', toString })
    expect(new Foo(1)).not.toStrictEqual({ a: 1, toString })
})

test('toBeOneOf', () => {
    expect('grape').not.toBeOneOf(['apple', 'banana', 'orange'])
})

test('toSatisfy() pass with negation', () => {
    const isOdd = (value: number) => value % 2 !== 0
    expect(2).not.toSatisfy(isOdd)
})
```

### .resolves

The `.resolves` matcher is used to work with promises. It unwraps the value from a resolved promise, allowing you to chain further assertions on that value. This is essential for testing asynchronous code in a clean and readable manner.

```typescript
test('Async operations', ({ expect }) => {
    test('resolves', async ({ }) => { // use expect here, becaulse lost in await 2nd
        (await expect(Promise.resolve('lemon')).resolves).toBe('lemon');
        (await expect(Promise.resolve('lemon')).resolves).not.toBe('octopus');
        (await expect(Promise.resolve('lemon')).resolves).toBe(expect.anything);
        (await expect(Promise.resolve('lemon')).resolves).not.toBe(expect.anything)
    })
})

test('mockFn.mockResolvedValue', async () => {
    const asyncMock = fn().mockResolvedValue(43);
    (await expect(asyncMock()).resolves).toBe(43)
})

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

test('mockFn.mockRejectedValueOnce', async ({ expect }) => {
    const asyncMock = fn()
        .mockResolvedValueOnce('first call')
        .mockRejectedValueOnce(new Error('Async error message'));

    (await expect(asyncMock()).resolves).toBe('first call');
})
```

### .rejects

The `.rejects` matcher is the counterpart to `.resolves`. It is used to assert that a promise is rejected. You can chain this with other matchers, like `.toThrow()`, to make assertions about the rejection reason (the error).

```typescript
test('Async operations', ({ expect }) => {
    test('rejects', async ({ }) => { // use expect here, becaulse lost in await 2nd
        (await expect(Promise.reject(new Error('octopus'))).rejects).toThrow('octopus');
        (await expect(Promise.reject(new Error('octopus'))).rejects).not.toThrow('lemon');
        (await expect(Promise.reject(new Error('octopus'))).rejects).toThrow(expect.anything);
        (await expect(Promise.reject(new Error('octopus'))).rejects).not.toThrow(expect.anything)
    })
})

test('mockFn.mockRejectedValue', async () => {
    const asyncMock = fn()
        .mockRejectedValue(new Error('Async error message'));

    (await expect(asyncMock()).rejects).toThrow('Async error message')
})

test('mockFn.mockRejectedValueOnce', async ({ expect }) => {
    const asyncMock = fn()
        .mockResolvedValueOnce('first call')
        .mockRejectedValueOnce(new Error('Async error message'));

    (await expect(asyncMock()).rejects).toThrow('Async error message')
})
```

### .toHaveBeenCalled()

The `.toHaveBeenCalled()` matcher asserts that a mock function (created with `fn()` or `spyOn()`) has been called at least once. This is a fundamental assertion for verifying that a particular piece of code was executed as part of a test.

```typescript
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

test('mockFn.mockName, mockReturnThis, mockReturnValue', () => {
    const mockFn = fn().mockName('mockedFunction')
    expect(mockFn).toHaveBeenCalled()
})

test('plays video', () => {

    const video = {
        // it's a getter!
        get play() {
            return true
        },
    }
    const spy = spyOn(video, 'play', 'get') // we pass 'get'
    const isPlaying = video.play

    expect(spy).toHaveBeenCalled()
})

test('plays audio', () => {
    const audio = {
        _volume: 50,
        // it's a setter!
        set volume(value) {
            this._volume = value
        },
        get volume() {
            return this._volume
        },
    }

    const spy = spyOn(audio, 'volume', 'set') // we pass 'set'
    audio.volume = 100

    expect(spy).toHaveBeenCalled()
})
```

### .toHaveBeenCalledTimes()

The `.toHaveBeenCalledTimes()` matcher asserts that a mock function was called an exact number of times. This is useful for ensuring that a function is called a specific number of times, no more and no less.

```typescript
test('drinkEach drinks each drink', () => {
    const drink = fn()
    drink('lemon')
    drink('octopus')
    expect(drink).toHaveBeenCalledTimes(2)
    expect(drink).toHaveBeenCalledTimes(expect.anything)
})
```

### .toHaveBeenCalledWith()

The `.toHaveBeenCalledWith()` matcher asserts that a mock function was called with specific arguments. This allows you to verify not just that a function was called, but also that it received the correct inputs.

```typescript
test('toHaveBeenCalledWith', () => {
    const drink = fn()
    drink('lemon', 'juice')
    expect(drink).toHaveBeenCalledWith('lemon', 'juice')
    expect(drink).not.toHaveBeenCalledWith('orange')

    expect(drink).toHaveBeenCalledWith(expect.anything)
    expect(drink).not.toHaveBeenCalledWith(expect.anything)
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

### .toHaveBeenCalledLastCalledWith()

The `.toHaveBeenCalledLastCalledWith()` matcher asserts that the most recent call to a mock function was made with specific arguments. This is useful for testing scenarios where the final interaction with a mock is the most important one.

```typescript
test('toHaveBeenCalledLastCalledWith', () => {
    const drink = fn()
    drink('lemon')
    drink('orange')
    expect(drink).toHaveBeenCalledLastCalledWith('orange')
    expect(drink).not.toHaveBeenCalledLastCalledWith('lemon')

    expect(drink).toHaveBeenCalledLastCalledWith(expect.anything)
    expect(drink).not.toHaveBeenCalledLastCalledWith(expect.anything)
})
```

### .toHaveBeenCalledNthCalledWith()

The `.toHaveBeenCalledNthCalledWith()` matcher asserts that the Nth call to a mock function was made with specific arguments. This provides fine-grained control for verifying the arguments of each call in a sequence.

```typescript
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
```

### .toHaveReturnedTimes()

The `.toHaveReturnedTimes()` matcher asserts that a mock function has returned a value a specific number of times. This is useful for checking how many times a function successfully completed its execution.

```typescript
test('toHaveReturnedTimes', () => {
    const func = fn()
    func()
    func()
    expect(func).toHaveReturnedTimes(2)
    expect(func).not.toHaveReturnedTimes(1)
    expect(func).toHaveReturnedTimes(expect.anything)
    expect(func).not.toHaveReturnedTimes(expect.anything)
})
```

### .toHaveReturnedWith()

The `.toHaveReturnedWith()` matcher asserts that a mock function returned a specific value at least once. This is useful for verifying the output of a function.

```typescript
test('toHaveReturnedWith', () => {
    const func = fn(() => 'lemon')
    func()
    expect(func).toHaveReturnedWith('lemon')
    expect(func).not.toHaveReturnedWith('orange')
    expect(func).toHaveReturnedWith(expect.anything)
    expect(func).not.toHaveReturnedWith(expect.anything)
})

test('drink returns La Croix', () => {
    const beverage = { name: 'La Croix', toString }
    const drink = fn((beverage: { name: string }) => beverage.name)

    drink(beverage)

    expect(drink).toHaveReturnedWith('La Croix')
})
```

### .toHaveLastReturnedWith()

The `.toHaveLastReturnedWith()` matcher asserts that the last successful return from a mock function was a specific value. This is useful for checking the result of the final call to a function.

```typescript
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
```

### .toHaveNthReturnedWith()

The `.toHaveNthReturnedWith()` matcher asserts that the Nth successful return from a mock function was a specific value. This allows you to inspect the return value of each individual call.

```typescript
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
```

### .toHaveLength()

The `.toHaveLength()` matcher asserts that an object has a `.length` property and that its value is equal to a specific number. This is commonly used for arrays and strings.

```typescript
test('toHaveLength', () => {
    expect([1, 2, 3]).toHaveLength(3)
    expect('abc').toHaveLength(3)
    expect([]).not.toHaveLength(1)
    expect('abc').toHaveLength(expect.anything)
})

test('createMockFromModule should run example code', (/* { expect } */) => {
    // creates a new mocked function with no formal arguments.
    expect(example.function.name).toBe('square')
    expect(example.function).toHaveLength(0)

    // async functions get the same treatment as standard synchronous functions.
    expect(example.asyncFunction.name).toBe('asyncSquare')
    expect(example.asyncFunction).toHaveLength(0)

    // creates a new class with the same interface, member functions and properties are mocked.
    expect(example.class.array).toHaveLength(0)

    // creates a new empty array, ignoring the original array.
    expect(example.array).toHaveLength(0)
})
```

### .toHaveProperty()

The `.toHaveProperty()` matcher asserts that an object has a property at a given key path. You can optionally also assert that the property has a specific value.

```typescript
test('toHaveProperty', () => {
    const obj = { a: 1, b: 'hello', toString }
    expect(obj).toHaveProperty('a')
    expect(obj).toHaveProperty('b', 'hello')
    expect(obj).not.toHaveProperty('c')
    expect(obj).not.toHaveProperty('a', 2)
})
```

### .toBeCloseTo()

The `.toBeCloseTo()` matcher is used to compare floating-point numbers. It asserts that a number is close to another number within a specified precision, which helps avoid issues with floating-point inaccuracies.

```typescript
test('toBeCloseTo', () => {
    expect(0.1 + 0.2).toBeCloseTo(0.3, 5)
    expect(0.1 + 0.2).not.toBeCloseTo(0.3, 10) //fail case
    expect(0.1 + 0.2).toBeCloseTo(expect.anything)
})
```

### .toBeDefined()

The `.toBeDefined()` matcher asserts that a value is not `undefined`. This is a simple way to check that a variable has been assigned a value.

```typescript
test('toBeDefined', () => {
    const x = 1
    const y: any = undefined
    expect(x).toBeDefined()
    expect(y).not.toBeDefined()
})
```

### .toBeFalsy()

The `.toBeFalsy()` matcher asserts that a value is "falsy" in a boolean context. The values that are considered falsy are `false`, `0`, `''` (empty string), `null`, and `undefined`.

```typescript
test('toBeFalsy', () => {
    expect(false).toBeFalsy()
    expect(0).toBeFalsy()
    expect('').toBeFalsy()
    expect(null).toBeFalsy()
    expect(undefined).toBeFalsy()
    expect(true).not.toBeFalsy()
})
```

### .toBeTruthy()

The `.toBeTruthy()` matcher asserts that a value is "truthy" in a boolean context. Any value that is not falsy is considered truthy.

```typescript
test('toBeTruthy', () => {
    expect(true).toBeTruthy()
    expect(1).toBeTruthy()
    expect('hello').toBeTruthy()
    expect({}).toBeTruthy()
    expect([]).toBeTruthy()
    expect(false).not.toBeTruthy()
})
```

### .toBeInstanceOf()

The `.toBeInstanceOf()` matcher asserts that an object is an instance of a specific class or constructor. This is useful for checking the type of an object.

```typescript
test('toBeInstanceOf', () => {
    class Foo { }
    expect(new Foo()).toBeInstanceOf(Foo)
    expect([]).toBeInstanceOf(Array)
    expect({}).not.toBeInstanceOf(Array)
    expect([]).toBeInstanceOf(expect.anything)
    expect({}).not.toBeInstanceOf(expect.anything)
})
```

### Numeric Comparisons

These matchers are used for comparing numeric values.

#### .toBeGreaterThan()

Asserts that a number is greater than another number.

```typescript
test('numeric comparisons', () => {
    expect(10).toBeGreaterThan(5)
    expect(10).not.toBeGreaterThan(15)
})
```

#### .toBeGreaterThanOrEqual()

Asserts that a number is greater than or equal to another number.

```typescript
test('numeric comparisons', () => {
    expect(10).toBeGreaterThanOrEqual(10)
    expect(10).not.toBeGreaterThanOrEqual(11)
})
```

#### .toBeLessThan()

Asserts that a number is less than another number.

```typescript
test('numeric comparisons', () => {
    expect(5).toBeLessThan(10)
    expect(15).not.toBeLessThan(10)
})
```

#### .toBeLessThanOrEqual()

Asserts that a number is less than or equal to another number.

```typescript
test('numeric comparisons', () => {
    expect(10).toBeLessThanOrEqual(10)
    expect(10).not.toBeLessThanOrEqual(9)
})
```

#### Comparison Operators (>, >=, <, <=)

You can also use the direct comparison operators for a more concise syntax.

```typescript
test('numeric comparisons', () => {
    expect(10)['>'](5)
    expect(10)['>='](10)
    expect(5)['<'](10)
    expect(10)['<='](10)

    expect(10)['>'](expect.anything)
    expect(10)['>='](expect.anything)
    expect(5)['<'](expect.anything)
    expect(10)['<='](expect.anything)
})
```

### .toBeNull()

The `.toBeNull()` matcher asserts that a value is strictly equal to `null`.

```typescript
test('toBeNull', () => {
    expect(null).toBeNull()
    expect(undefined).not.toBeNull()
    expect(0).not.toBeNull()
})
```

### .toBeUndefined()

The `.toBeUndefined()` matcher asserts that a value is strictly equal to `undefined`.

```typescript
test('toBeUndefined', () => {
    let x
    expect(x).toBeUndefined()
    expect(null).not.toBeUndefined()
    expect(0).not.toBeUndefined()
})
```

### .toBeNaN()

The `.toBeNaN()` matcher asserts that a value is `NaN` (Not a Number).

```typescript
test('toBeNaN', () => {
    expect(NaN).toBeNaN()
    expect(0).not.toBeNaN()
    expect('abc').not.toBeNaN() //fail case
})
```

### .toContain()

The `.toContain()` matcher asserts that an array or string contains a specific item or substring. For arrays, it uses strict equality (`===`) to check for the presence of the item.

```typescript
test('toContain', () => {
    expect([1, 2, 3]).toContain(2)
    expect([1, 2, 3]).not.toContain(4)
    expect('hello world').toContain('world')
    expect('hello world').not.toContain('foo')

    expect('hello world').toContain(anything)
    expect([1, 2, 3]).not.toContain(anything)
})
```

### .toContainEqual()

The `.toContainEqual()` matcher asserts that an array contains an element that is deeply equal to the expected value. This is useful for checking for the presence of objects in an array.

```typescript
test('toContainEqual', () => {
    const arr = [{ a: 1, toString }, { b: 2, toString }]
    expect(arr).toContainEqual({ a: 1, toString })
    expect(arr).not.toContainEqual({ c: 3, toString })
})
```

### .toMatch()

The `.toMatch()` matcher asserts that a string matches a regular expression or a substring. This is useful for validating string formats, such as URLs, email addresses, or any other pattern-based text.

```typescript
test('toMatch', () => {
    expect('hello world').toMatch(/world/);
    expect('hello world').toMatch('world');
    expect('hello world').not.toMatch(/foo/);
});
```

### .toMatchObject()

The `.toMatchObject()` matcher asserts that an object matches a subset of the properties of another object. This is particularly useful when you want to check for the presence and value of specific keys in an object without needing to verify the entire object structure.

```typescript
test('toMatchObject', () => {
    const obj = { a: 1, b: { c: 2, d: 3, toString }, toString };
    expect(obj).toMatchObject({ a: 1, toString });
    expect(obj).toMatchObject({ b: { c: 2, toString }, toString });
    expect(obj).not.toMatchObject({ a: 2, toString });
    expect(obj).not.toMatchObject({ b: { e: 4, toString }, toString });
});
```

### .toStrictEqual()

The `.toStrictEqual()` matcher asserts that a value is strictly equal to another value. It performs a deep comparison, including checking that the types and structures of the objects are the same.

```typescript
test('toStrictEqual', () => {
    class Foo { constructor(public a: number) { } toString() { return JSON.stringify(this) } }
    expect(new Foo(1)).toStrictEqual(new Foo(1))
    expect({ a: 1, b: 2, toString }).toStrictEqual({ a: 1, b: 2, toString })
    expect([1, 2, 3]).toStrictEqual([1, 2, 3])
    expect({ a: 1, b: 2, toString }).not.toStrictEqual({ a: 1, b: '2', toString })
    expect(new Foo(1)).not.toStrictEqual({ a: 1, toString })
})
```

### .toBeOneOf()

The `.toBeOneOf()` matcher asserts that a value is present in a given array of values.

```typescript
test('toBeOneOf', () => {
    expect('apple').toBeOneOf(['apple', 'banana', 'orange'])
    expect('grape').not.toBeOneOf(['apple', 'banana', 'orange'])
})
```

### .toBeTypeOf()

The `.toBeTypeOf()` matcher asserts that a value is of a specific primitive type, as determined by `typeof`.

```typescript
test('toBeTypeOf', () => {
    expect('hello').toBeTypeOf('string')
    expect(123).toBeTypeOf('number')
    expect(true).toBeTypeOf('boolean')
    expect({}).toBeTypeOf('object')
    expect([]).toBeTypeOf('object')
    expect(() => { }).toBeTypeOf('function')
    expect(undefined).toBeTypeOf('undefined')
    expect(BigInt(9007199254740991)).toBeTypeOf('bigint')
    expect(Symbol('id')).toBeTypeOf('symbol')
})
```

### .toHaveResolved()

The `.toHaveResolved()` matcher asserts that a promise returned by a spy function has resolved.

```typescript
test('spy function resolved a value', async ({ expect }) => {
    const getApplesPrice = async (amount: number) => amount * 10 // Simplified for testing
    const getPriceSpy = fn(getApplesPrice)

    const price = await getPriceSpy(10)

    expect(price).toBe(100)
    expect(getPriceSpy).toHaveResolved()
})
```

### .toHaveResolvedTimes()

The `.toHaveResolvedTimes()` matcher asserts that a promise returned by a spy function has resolved a specific number of times.

```typescript
test('spy function resolved a value two times', async ({ expect }) => {
    const sell = fn((product: string) => Promise.resolve({ product }))

    await sell('apples')
    await sell('bananas')

    expect(sell).toHaveResolvedTimes(2)
})
```

### .toHaveResolvedWith()

The `.toHaveResolvedWith()` matcher asserts that a promise returned by a spy function has resolved with a specific value.

```typescript
test('spy function resolved a product', async ({ expect }) => {
    const sell = fn((product: string) => Promise.resolve({ product }))

    await sell('apples')

    expect(sell).toHaveResolvedWith({ product: 'apples' })
})
```

### .toHaveLastResolvedWith()

The `.toHaveLastResolvedWith()` matcher asserts that the last promise returned by a spy function has resolved with a specific value.

```typescript
test('spy function resolves bananas on a last call', async ({ expect }) => {
    const sell = fn((product: string) => Promise.resolve({ product }))

    await sell('apples')
    await sell('bananas')

    expect(sell).toHaveLastResolvedWith({ product: 'bananas' })
})
```

### .toHaveNthResolvedWith()

The `.toHaveNthResolvedWith()` matcher asserts that the Nth promise returned by a spy function has resolved with a specific value.

```typescript
test('spy function returns bananas on second call', async ({ expect }) => {
    const sell = fn((product: string) => Promise.resolve({ product }))

    await sell('apples')
    await sell('bananas')

    expect(sell).toHaveNthResolvedWith(2, { product: 'bananas' })
})
```

### .toSatisfy()

The `.toSatisfy()` matcher asserts that a value satisfies a given predicate function. The predicate function should return `true` if the value is satisfactory, and `false` otherwise.

```typescript
test('toSatisfy() pass with 0', () => {
    const isOdd = (value: number) => value % 2 !== 0
    expect(1).toSatisfy(isOdd)
})

test('toSatisfy() pass with negation', () => {
    const isOdd = (value: number) => value % 2 !== 0
    expect(2).not.toSatisfy(isOdd)
})
```

### .toThrow()

The `.toThrow()` matcher asserts that a function throws an error when called. You can also assert that the error message matches a specific string or regular expression.

```typescript
test('Async operations', ({ expect }) => {
    test('rejects', async ({ }) => { // use expect here, becaulse lost in await 2nd
        (await expect(Promise.reject(new Error('octopus'))).rejects).toThrow('octopus');
        (await expect(Promise.reject(new Error('octopus'))).rejects).not.toThrow('lemon');
        (await expect(Promise.reject(new Error('octopus'))).rejects).toThrow(expect.anything);
        (await expect(Promise.reject(new Error('octopus'))).rejects).not.toThrow(expect.anything)
    })
})

test('mockFn.mockRejectedValue', async () => {
    const asyncMock = fn()
        .mockRejectedValue(new Error('Async error message'));

    (await expect(asyncMock()).rejects).toThrow('Async error message')
})

test('mockFn.mockRejectedValueOnce', async ({ expect }) => {
    const asyncMock = fn()
        .mockResolvedValueOnce('first call')
        .mockRejectedValueOnce(new Error('Async error message'));

    (await expect(asyncMock()).rejects).toThrow('Async error message')
})
```

### Static Matchers

Static matchers are accessed directly from the `expect` object and provide powerful, flexible ways to assert conditions in your tests. They are particularly useful when you don't need to assert an exact value, but rather that a value conforms to a certain type or structure.

#### `expect.anything`

The `expect.anything` special matcher matches any value that is not `null` or `undefined`. This is useful when you want to assert that a value was received, without caring about what the specific value is.

```typescript
test('Sample 1', {}, ({ }) => {
    expect(1 + 10)["==="](expect.anything)
})

test('Sample 2', {}, ({ }) => {
    const a = { b: 1 }
    expect((a as any).c)["==="](expect.anything)
})

test('Sample 4 not', {}, ({ }) => {
    expect(1).not.eq(expect.anything)
})

test('Async operations', ({ expect }) => {
    test('resolves', async ({ }) => { // use expect here, becaulse lost in await 2nd
        (await expect(Promise.resolve('lemon')).resolves).toBe(expect.anything);
        (await expect(Promise.resolve('lemon')).resolves).not.toBe(expect.anything)
    })

    test('rejects', async ({ }) => { // use expect here, becaulse lost in await 2nd
        (await expect(Promise.reject(new Error('octopus'))).rejects).toThrow(expect.anything);
        (await expect(Promise.reject(new Error('octopus'))).rejects).not.toThrow(expect.anything)
    })
})

test('drinkEach drinks each drink', () => {
    const drink = fn()
    drink('lemon')
    drink('octopus')
    expect(drink).toHaveBeenCalledTimes(expect.anything)
})

test('toHaveBeenCalledWith', () => {
    const drink = fn()
    drink('lemon', 'juice')
    expect(drink).toHaveBeenCalledWith(expect.anything)
    expect(drink).not.toHaveBeenCalledWith(expect.anything)
})

test('toHaveBeenCalledLastCalledWith', () => {
    const drink = fn()
    drink('lemon')
    drink('orange')
    expect(drink).toHaveBeenCalledLastCalledWith(expect.anything)
    expect(drink).not.toHaveBeenCalledLastCalledWith(expect.anything)
})

test('toHaveBeenCalledNthCalledWith', () => {
    const drink = fn()
    drink('lemon')
    drink('orange')
    drink('apple')
    expect(drink).not.toHaveBeenCalledNthCalledWith(3, expect.anything)
})

test('toHaveReturnedTimes', () => {
    const func = fn()
    func()
    func()
    expect(func).toHaveReturnedTimes(expect.anything)
    expect(func).not.toHaveReturnedTimes(expect.anything)
})

test('toHaveReturnedWith', () => {
    const func = fn(() => 'lemon')
    func()
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
    expect(func).not.toHaveNthReturnedWith(3, expect.anything)
})

test('toHaveLength', () => {
    expect('abc').toHaveLength(expect.anything)
})

test('toBeCloseTo', () => {
    expect(0.1 + 0.2).toBeCloseTo(expect.anything)
})

test('toBeInstanceOf', () => {
    expect([]).toBeInstanceOf(expect.anything)
    expect({}).not.toBeInstanceOf(expect.anything)
})

test('numeric comparisons', () => {
    expect(10)['>'](expect.anything)
    expect(10)['>='](expect.anything)
    expect(5)['<'](expect.anything)
    expect(10)['<='](expect.anything)
})

test('toContain', () => {
    expect('hello world').toContain(anything)
    expect([1, 2, 3]).not.toContain(anything)
})

test('map calls its argument with a non-null argument', () => {
    const mock = fn();
    [1].map(x => mock(x))
    expect(mock).toHaveBeenCalledWith(expect.anything)
})
```

#### `expect.any(Constructor)`

The `expect.any(Constructor)` special matcher asserts that a value is an instance of the provided `Constructor` (e.g., `expect.any(Number)`, `expect.any(String)`, `expect.any(Array)`). This is useful for type-checking values without asserting their exact content.

```typescript
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
