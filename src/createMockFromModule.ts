/**
 * @file Provides utilities for creating deep mocks of modules, classes, functions, and objects.
 * This is crucial for isolating units of code during testing by replacing their dependencies with controlled, mock versions.
 */

import { fn } from './fn'

// Define a type for a class constructor
type ClassConstructor<T> = new (...args: any[]) => T

// Define a type for a mocked instance of a class
// All methods are mocked functions, properties are undefined by default
type MockedClassInstance<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
  ? ReturnType<typeof fn<T[K]>>
  : undefined // Mock properties to be undefined
}

/**
 * Creates a new class where the interface of the original class is maintained,
 * and all of its class member functions and properties will be mocked.
 *
 * @param OriginalClass The original class constructor to mock.
 * @returns A new class constructor that, when instantiated, provides a mocked version of the original class.
 */
function createMockFromClass<T>(OriginalClass: ClassConstructor<T>): ClassConstructor<MockedClassInstance<T>> {
  // Create a new class that will serve as the mock.
  // This class will have the same methods and properties as OriginalClass,
  // but they will be replaced with mock functions or undefined values.
  class MockedClass {
    constructor(...args: any[]) {
      // Iterate over the prototype chain of the OriginalClass to find methods and properties
      let currentProto = OriginalClass.prototype
      while (currentProto && currentProto !== Object.prototype) {
        Object.getOwnPropertyNames(currentProto).forEach(name => {
          // Skip the constructor itself
          if (name === 'constructor') {
            return
          }

          const descriptor = Object.getOwnPropertyDescriptor(currentProto, name)

          if (descriptor && typeof descriptor.value === 'function') {
            // If it's a method, replace it with a mock function
            (this as any)[name] = fn();
            // Optionally, give the mock function a name for better debugging
            (this as any)[name].mockName(name)
          } else if (descriptor && (descriptor.get || descriptor.set)) {
            // If it's a getter/setter property, define a mock getter that returns undefined
            Object.defineProperty(this, name, {
              get: () => undefined,
              configurable: true, // Allow redefining later if needed
            })
          } else {
            // If it's a data property, set its value to undefined
            (this as any)[name] = undefined
          }
        })
        currentProto = Object.getPrototypeOf(currentProto)
      }
    }
  }

  // Copy static properties and methods from the OriginalClass to the MockedClass
  // This ensures that static members are also available on the mock class.
  Object.getOwnPropertyNames(OriginalClass).forEach(name => {
    // Skip properties that are inherent to class constructors
    if (name === 'prototype' || name === 'length' || name === 'name') {
      return
    }
    const descriptor = Object.getOwnPropertyDescriptor(OriginalClass, name)
    if (descriptor) {
      Object.defineProperty(MockedClass, name, descriptor)
    }
  })

  // Set the name of the mocked class to be descriptive (e.g., "MockMyClass")
  Object.defineProperty(MockedClass, 'name', { value: `${OriginalClass.name}` })

  // Return the new mocked class constructor
  return MockedClass as ClassConstructor<MockedClassInstance<T>>
}

/**
 * Creates a mock function from a given function.
 * The returned mock function tracks calls and allows for custom implementations.
 * @param func The function to mock.
 * @returns A `MockedFunction` that wraps the original function.
 */
function mockFunction<F extends (...args: any[]) => any>(func: F): ReturnType<typeof fn<F>> {
  const mockedFunc = fn()
  // Attempt to set the name property of the mock function
  try {
    Object.defineProperty(mockedFunc, 'name', { value: func.name, configurable: true })
  } catch (e) {
    // Ignore if setting name fails (e.g., in strict mode or if already defined)
  }
  if (func.name) {
    mockedFunc.mockName(func.name)
  }
  return mockedFunc as ReturnType<typeof fn<F>>
}

/**
 * Recursively creates a deep mock of an object.
 * All properties that are functions will be replaced with mock functions.
 * All properties that are objects (including arrays and class instances) will be recursively mocked.
 * Primitive properties will retain their values.
 * @param obj The object to mock.
 * @returns A deeply mocked version of the input object.
 */
function mockObject<T extends object>(obj: T): T {
  const mockedObj: any = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = (obj as any)[key]

      // Check if the value is a class instance
      const isClassInstance = typeof value === 'object' && value !== null &&
        value.constructor && value.constructor !== Object &&
        value.constructor.prototype !== Object.prototype

      if (isClassInstance) {
        const isArray = Array.isArray(value)

        // If it's a class instance, create a new object that preserves its constructor
        const mockedInstance: any = isArray ? [] : {}
        Object.defineProperty(mockedInstance, 'constructor', {
          value: value.constructor,
          writable: true,
          configurable: true,
          enumerable: false // Typically, constructor is not enumerable
        })

        // Recursively mock the properties of the instance
        Object.keys(value).forEach(instanceKey => {
          // Exclude numerical keys (array indices)
          if (isNaN(Number(instanceKey)) || String(Number(instanceKey)) !== instanceKey && Object.prototype.hasOwnProperty.call(value, instanceKey)) {
            mockedInstance[instanceKey] = createMockFromModule((value as any)[instanceKey])
          }
        })

        if (!Array.isArray(value)) {
          // Also mock methods from the prototype chain
          let currentProto = value.constructor.prototype
          while (currentProto && currentProto !== Object.prototype) {
            Object.getOwnPropertyNames(currentProto).forEach(name => {
              if (name === 'constructor') {
                return
              }
              const descriptor = Object.getOwnPropertyDescriptor(currentProto, name)
              if (descriptor && typeof descriptor.value === 'function') {
                mockedInstance[name] = mockFunction(descriptor.value)
              }
            })
            currentProto = Object.getPrototypeOf(currentProto)
          }
        }
        mockedObj[key] = mockedInstance

      } else {
        // Otherwise, just recursively mock the value
        mockedObj[key] = createMockFromModule(value)
      }
    }
  }
  return mockedObj as T
}

/**
 * Creates a mock of an array. Currently, this returns an empty array.
 * @param arr The array to mock.
 * @returns An empty array, typed as the original array.
 */
function mockArray<T extends any[]>(arr: T): T {
  return [] as unknown as T
}

/**
 * Returns primitive values as they are, as they do not need to be mocked.
 * @param primitive The primitive value.
 * @returns The original primitive value.
 */
function mockPrimitive<T extends string | number | boolean | symbol | null | undefined>(primitive: T): T {
  return primitive
}

/**
 * The main function for creating a deep mock of any given module, class, function, or object.
 * It intelligently determines the type of the input and applies the appropriate mocking strategy.
 * 
 * @template T The type of the module to mock.
 * @param module The module, class, function, or object to be mocked.
 * @returns A deeply mocked version of the input.
 */
export function createMockFromModule<T>(module: T): T {
  if (typeof module === 'function') {
    // Check if it's a class constructor (starts with 'class ' or has a prototype with methods)
    // This is a heuristic and might not cover all edge cases.
    const isClass = module.toString().startsWith('class ') ||
      (module.prototype && Object.getOwnPropertyNames(module.prototype).some(name => name !== 'constructor' && typeof (module as any).prototype[name] === 'function'))

    if (isClass) {
      return createMockFromClass(module as ClassConstructor<any>) as T
    } else {
      return mockFunction(module as (...args: any[]) => any) as T
    }
  } else if (Array.isArray(module)) {
    return mockArray(module as any) as T
  } else if (typeof module === 'object' && module !== null) {
    return mockObject(module as object) as T
  } else {
    return mockPrimitive(module as any) as T
  }
}