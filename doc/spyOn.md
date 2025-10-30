# SpyOn API

The `spyOn` API allows you to spy on existing object methods or properties without changing their implementation. This is useful for asserting that a method was called, how many times, and with what arguments, or to track property access. Unlike a full mock, a spy preserves the original functionality while still allowing you to track its usage.

## Table of Contents

*   [Spying on Methods](#spying-on-methods)
*   [Spying on Getters](#spying-on-getters)
*   [Spying on Setters](#spying-on-setters)

---

## Spying on Methods

When you `spyOn` a method, the original method is still called, but you gain access to its call information. This allows you to verify that the method was called with the correct arguments and that it returned the expected value, without having to reimplement its logic.

```typescript
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
```

## Spying on Getters

You can spy on property getters by passing `'get'` as the third argument to `spyOn`. This allows you to track when a property is accessed.

```typescript
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

## Spying on Setters

You can spy on property setters by passing `'set'` as the third argument to `spyOn`. This allows you to track when a property is modified.

```typescript
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
```
