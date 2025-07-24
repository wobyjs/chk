# Match API

The `match` API provides advanced matching capabilities, often used with `expect` for more complex assertion scenarios. It allows for partial object matching, which is useful when you only need to verify a subset of an object's properties.

## Table of Contents

*   [`.toMatch()`](#tomatch)
*   [`.toMatchObject()`](#tomatchobject)

---

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