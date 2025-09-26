import { expect, test, anything, createMockFromModule, req, fn, spyOn, mock } from '@woby/chk'

// Assuming example.js is a CommonJS module, you might need to adjust how it's imported
// For simplicity, let's assume it can be imported directly or you'll handle the import mechanism.
// If not, you might need to mock the module differently or adjust your build process.
import exampleModule from './example'


const toString = function (this: any) { return JSON.stringify(this) }

test('Sample Test (sample.test.ts)', ({ }) => {
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

    test('Sample 4 not', {}, ({ }) => {
        expect(1).not.eq(2)
        expect(1).not.eq(1) // This should fail
        expect(1).not.eq(expect.anything)
    })

    test({ a: 1, b: 2, toString: () => '{ a: 1, b: 2,}' }, {}, ({ subject }) => {
        expect(subject.a)["==="](1)
        expect(subject.b)["==="](2)
    })

    test('Async operations', ({ }) => {
        test('resolves', async ({ expect }) => { // use expect here, because lost in await 2nd
            (await expect(Promise.resolve('lemon')).resolves).toBe('lemon');
            (await expect(Promise.resolve('lemon')).resolves).not.toBe('octopus');
            (await expect(Promise.resolve('lemon')).resolves).toBe(expect.anything);
            (await expect(Promise.resolve('lemon')).resolves).not.toBe(expect.anything)
        })

        test('rejects', async ({ expect }) => { // use expect here, expect lost in await 2nd
            // const ee = expect
            // const eee = SS.context(EXPECT_SYMBOL);

            (await expect(Promise.reject(new Error('octopus'))).rejects).toThrow('octopus');
            (await expect(Promise.reject(new Error('octopus'))).rejects).not.toThrow('lemon');
            (await expect(Promise.reject(new Error('octopus'))).rejects).toThrow(expect.anything);
            (await expect(Promise.reject(new Error('octopus'))).rejects).not.toThrow(expect.anything)
        })

    })

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

    test('toHaveLength', () => {
        expect([1, 2, 3]).toHaveLength(3)
        expect('abc').toHaveLength(3)
        expect([]).not.toHaveLength(1)
        expect('abc').toHaveLength(expect.anything)
    })

    test('toHaveProperty', () => {
        const obj = { a: 1, b: 'hello', toString }
        expect(obj).toHaveProperty('a')
        expect(obj).toHaveProperty('b', 'hello')
        expect(obj).not.toHaveProperty('c')
        expect(obj).not.toHaveProperty('a', 2)
    })

    test('toBeCloseTo', () => {
        expect(0.1 + 0.2).toBeCloseTo(0.3, 5)
        expect(0.1 + 0.2).not.toBeCloseTo(0.3, 10) //fail case
        expect(0.1 + 0.2).toBeCloseTo(expect.anything)
    })

    test('toBeDefined', () => {
        const x = 1
        const y: any = undefined
        expect(x).toBeDefined()
        expect(y).not.toBeDefined()
    })

    test('toBeFalsy', () => {
        expect(false).toBeFalsy()
        expect(0).toBeFalsy()
        expect('').toBeFalsy()
        expect(null).toBeFalsy()
        expect(undefined).toBeFalsy()
        expect(true).not.toBeFalsy()
    })

    test('toBeTruthy', () => {
        expect(true).toBeTruthy()
        expect(1).toBeTruthy()
        expect('hello').toBeTruthy()
        expect({}).toBeTruthy()
        expect([]).toBeTruthy()
        expect(false).not.toBeTruthy()
    })

    test('toBeInstanceOf', () => {
        class Foo { }
        expect(new Foo()).toBeInstanceOf(Foo)
        expect([]).toBeInstanceOf(Array)
        expect({}).not.toBeInstanceOf(Array)
        expect([]).toBeInstanceOf(expect.anything)
        expect({}).not.toBeInstanceOf(expect.anything)
    })

    test('numeric comparisons', () => {
        expect(10).toBeGreaterThan(5)
        expect(10).not.toBeGreaterThan(15)
        expect(10).toBeGreaterThanOrEqual(10)
        expect(10).not.toBeGreaterThanOrEqual(11)
        expect(5).toBeLessThan(10)
        expect(15).not.toBeLessThan(10)
        expect(10).toBeLessThanOrEqual(10)
        expect(10).not.toBeLessThanOrEqual(9)
        expect(10)['>'](5)
        expect(10)['>='](10)
        expect(5)['<'](10)
        expect(10)['<='](10)

        expect(10)['>'](expect.anything)
        expect(10)['>='](expect.anything)
        expect(5)['<'](expect.anything)
        expect(10)['<='](expect.anything)
    })

    test('toBeNull', () => {
        expect(null).toBeNull()
        expect(undefined).not.toBeNull()
        expect(0).not.toBeNull()
    })

    test('toBeUndefined', () => {
        let x
        expect(x).toBeUndefined()
        expect(null).not.toBeUndefined()
        expect(0).not.toBeUndefined()
    })

    test('toBeNaN', () => {
        expect(NaN).toBeNaN()
        expect(0).not.toBeNaN()
        expect('abc').not.toBeNaN() //fail case
    })

    test('toContain', () => {
        expect([1, 2, 3]).toContain(2)
        expect([1, 2, 3]).not.toContain(4)
        expect('hello world').toContain('world')
        expect('hello world').not.toContain('foo')

        expect('hello world').toContain(anything)
        expect([1, 2, 3]).not.toContain(anything)
    })

    test('toContainEqual', () => {
        const arr = [{ a: 1, toString }, { b: 2, toString }]
        expect(arr).toContainEqual({ a: 1, toString })
        expect(arr).not.toContainEqual({ c: 3, toString })
    })

    test('toEqual', () => {
        expect({ a: 1, b: 2, toString }).toEqual({ a: 1, b: 2, toString })
        expect([1, 2, 3]).toEqual([1, 2, 3])
        expect({ a: 1, b: 2 }).not.toEqual({ a: 1, b: 3 })
    })

    test('toMatch', () => {
        expect('hello world').toMatch(/world/)
        expect('hello world').toMatch('world')
        expect('hello world').not.toMatch(/foo/)
    })

    test('toMatchObject', () => {
        const obj = { a: 1, b: { c: 2, d: 3, toString }, toString }
        expect(obj).toMatchObject({ a: 1, toString })
        expect(obj).toMatchObject({ b: { c: 2, toString }, toString })
        expect(obj).not.toMatchObject({ a: 2, toString })
        expect(obj).not.toMatchObject({ b: { e: 4, toString }, toString })
    })

    test('toStrictEqual', () => {
        class Foo { constructor(public a: number) { } toString() { return JSON.stringify(this) } }
        expect(new Foo(1)).toStrictEqual(new Foo(1))
        expect({ a: 1, b: 2, toString }).toStrictEqual({ a: 1, b: 2, toString })
        expect([1, 2, 3]).toStrictEqual([1, 2, 3])
        expect({ a: 1, b: 2, toString }).not.toStrictEqual({ a: 1, b: '2', toString })
        expect(new Foo(1)).not.toStrictEqual({ a: 1, toString })
    })

    test('toBeOneOf', () => {
        expect('apple').toBeOneOf(['apple', 'banana', 'orange'])
        expect('grape').not.toBeOneOf(['apple', 'banana', 'orange'])
    })

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

    test('mockFn.instances', () => {
        const mockFn = fn()
        const a = new (mockFn as any)()
        const b = new (mockFn as any)()
        expect(mockFn.mock.instances[0]).toBe(a)
        expect(mockFn.mock.instances[1]).toBe(b)
    })

    test('mockFn.lastCall', () => {
        const mockFn = fn()
        mockFn(1, 2)
        mockFn(3, 4)
        const a = mockFn.mock.lastCall
        expect(mockFn.mock.lastCall).toEqual([3, 4])
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

    test('mockFn.mockRejectedValue', async () => {
        const asyncMock = fn()
            .mockRejectedValue(new Error('Async error message'));

        (await expect(asyncMock()).rejects).toThrow('Async error message')
    })

    test('mockFn.mockRejectedValueOnce', async ({ expect }) => {
        const asyncMock = fn()
            .mockResolvedValueOnce('first call')
            .mockRejectedValueOnce(new Error('Async error message'));

        (await expect(asyncMock()).resolves).toBe('first call');
        (await expect(asyncMock()).rejects).toThrow('Async error message')
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

    test('spy function resolved a value two times', async ({ expect }) => {
        const sell = fn((product: string) => Promise.resolve({ product }))

        await sell('apples')
        await sell('bananas')

        expect(sell).toHaveResolvedTimes(2)
    })

    test('spy function resolved a product', async ({ expect }) => {
        const sell = fn((product: string) => Promise.resolve({ product }))

        await sell('apples')

        expect(sell).toHaveResolvedWith({ product: 'apples' })
    })

    test('spy function resolves bananas on a last call', async ({ expect }) => {
        const sell = fn((product: string) => Promise.resolve({ product }))

        await sell('apples')
        await sell('bananas')

        expect(sell).toHaveLastResolvedWith({ product: 'bananas' })
    })

    test('spy function returns bananas on second call', async ({ expect }) => {
        const sell = fn((product: string) => Promise.resolve({ product }))

        await sell('apples')
        await sell('bananas')

        expect(sell).toHaveNthResolvedWith(2, { product: 'bananas' })
    })

    test('toSatisfy() pass with 0', () => {
        const isOdd = (value: number) => value % 2 !== 0
        expect(1).toSatisfy(isOdd)
    })

    test('toSatisfy() pass with negation', () => {
        const isOdd = (value: number) => value % 2 !== 0
        expect(2).not.toSatisfy(isOdd)
    })


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
        expect(audio.volume).toBe(100)
    })
})