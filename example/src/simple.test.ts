import { expect, test } from '@woby/chk'

test('Simple addition', () => {
    expect(1 + 1).toBe(2)

    test('Simple subtraction', () => {
        expect(5 - 3).toBe(2)
    })

    test('Simple multiplication', () => {
        expect(3 * 4).toBe(12)
    })

})

