/**
 * @file Implements the `spyOn` function, which allows for creating mock functions that track calls
 * to existing object methods, getters, or setters without altering their original behavior.
 */

import { fn, MockedFunction } from './fn'

/**
 * Retrieves the property descriptor for a given property on an object or its prototype chain.
 * @param obj The object to search.
 * @param key The name of the property.
 * @returns The property descriptor if found, otherwise `undefined`.
 */
function getPropertyDescriptor(obj: object, key: PropertyKey) {
  let current = obj
  while (current) {
    const descriptor = Object.getOwnPropertyDescriptor(current, key)
    if (descriptor) {
      return descriptor
    }
    current = Object.getPrototypeOf(current)
  }
  return undefined
}

/**
 * Creates a spy on an object's method, getter, or setter.
 * When spying on a method, the original method is called and its behavior is preserved,
 * but all calls are tracked by the returned mocked function.
 * When spying on a getter or setter, the original getter/setter is called,
 * and its calls are tracked.
 * 
 * @template T The type of the object.
 * @template K The key of the method or property to spy on.
 * 
 * @param obj The object to spy on.
 * @param methodName The name of the method or property to spy on.
 * @param accessType Optional: Specifies whether to spy on a 'get' (getter) or 'set' (setter).
 * 
 * @returns A `MockedFunction` that tracks calls to the spied method, getter, or setter.
 * 
 * @throws {Error} If the property does not exist, or if trying to spy on a non-function property without specifying `accessType`,
 * or if trying to spy on a getter/setter that doesn't exist.
 */
// Spy on getter
export function spyOn<T extends object, K extends keyof T>(obj: T, methodName: K, accessType: 'get'): MockedFunction<() => T[K]>;
// Spy on setter
export function spyOn<T extends object, K extends keyof T>(obj: T, methodName: K, accessType: 'set'): MockedFunction<(v: T[K]) => void>;
// Spy on method
export function spyOn<T extends object, K extends keyof T>(obj: T, methodName: K): MockedFunction<T[K] extends (...args: any[]) => any ? T[K] : never>;
// Implementation
export function spyOn<T extends object, K extends keyof T>(
  obj: T,
  methodName: K,
  accessType?: 'get' | 'set'
): MockedFunction<any> {
  if (accessType) {
    const descriptor = getPropertyDescriptor(obj, methodName as string)

    if (!descriptor) {
      throw new Error(`Property ${String(methodName)} does not exist on object.`)
    }

    const originalMockRestoreFn = () => {
      Object.defineProperty(obj, methodName, descriptor)
    }

    if (accessType === 'get') {
      const originalGetter = descriptor.get
      if (!originalGetter) {
        throw new Error(`Cannot spy on getter of property ${String(methodName)} as it does not exist.`)
      }
      const mockedFn = fn(originalGetter.bind(obj))
      const originalMockRestore = mockedFn.mockRestore
      mockedFn.mockRestore = () => {
        originalMockRestoreFn()
        originalMockRestore()
      }
      const { value, writable, ...rest } = descriptor
      Object.defineProperty(obj, methodName, {
        ...rest,
        get: mockedFn,
      })
      return mockedFn
    }

    if (accessType === 'set') {
      const originalSetter = descriptor.set
      if (!originalSetter) {
        throw new Error(`Cannot spy on setter of property ${String(methodName)} as it does not exist.`)
      }
      const mockedFn = fn(originalSetter.bind(obj))
      const originalMockRestore = mockedFn.mockRestore
      mockedFn.mockRestore = () => {
        originalMockRestoreFn()
        originalMockRestore()
      }
      const { value, writable, ...rest } = descriptor
      Object.defineProperty(obj, methodName, {
        ...rest,
        set: mockedFn,
      })
      return mockedFn
    }
  }

  const originalMethod = obj[methodName]

  if (typeof originalMethod !== 'function') {
    throw new Error(`Cannot spy on property ${String(methodName)} as it is not a function. Use the 'get' or 'set' accessType to spy on getters or setters.`)
  }

  const mockedFn = fn(originalMethod as any)

  // Override mockRestore to restore the original method
  const originalMockRestore = mockedFn.mockRestore
  mockedFn.mockRestore = () => {
    obj[methodName] = originalMethod
    originalMockRestore()
  };

  // Replace the original method with the mocked function
  (obj as any)[methodName] = mockedFn

  return mockedFn
}