export default {
  function: function square(a: number, b: number) {
    return a * b
  },
  asyncFunction: async function asyncSquare(a: any, b: number) {
    const result = (await a) * b
    return result
  },
  class: new (class Bar {
    array: number[]
    constructor() {
      this.array = [3, 2, 1]
    }
    foo() { }
  })(),
  object: {
    baz: 'foo',
    bar: {
      fiz: 1,
      buzz: [1, 2, 3],
    },
  },
  array: [1, 2, 3],
  number: 123,
  string: 'baz',
  boolean: true,
  symbol: Symbol.for('a.b.c'),
}
