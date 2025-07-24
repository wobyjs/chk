/**
 * @file Implements the `fn` function, which creates mock functions for testing purposes.
 * These mock functions allow tracking of calls, arguments, and return values, and provide
 * methods for controlling their behavior during tests.
 */

/**
 * Represents a mocked function, extending a regular function with properties and methods for testing.
 * It tracks calls, instances, and results, and allows for custom implementations and return values.
 * @template T The type of the function being mocked.
 */
export interface MockedFunction<T extends (...args: any[]) => any> extends Function {
    /**
     * The mocked function itself, callable with the original function's parameters.
     */
    (...args: Parameters<T>): ReturnType<T>
    /**
     * Constructor signature for when the mocked function is called with `new`.
     */
    new(...args: Parameters<T>): ReturnType<T>
    /**
     * Contains all information about calls to the mock function.
     */
    mock: {
        /** The name of the mock function. */
        name: string
        /** An array of all arguments calls that have been made to the mock function. */
        calls: any[][]
        /** An array of all `this` contexts for calls to the mock function. */
        instances: any[]
        /** An array of all results from calls to the mock function. */
        results: { type: 'return' | 'throw', value?: any, error?: any }[]
        /** The arguments of the last call to the mock function. */
        lastCall: any
    }
    /** Indicates that this is a mock function. */
    isMockFunction: true
    /** Clears all tracking data (calls, instances, results) from the mock function. */
    mockClear(): void
    /** Resets the mock function to its initial state, clearing all tracking data and implementations. */
    mockReset(): void
    /** Restores the original implementation of a spied-on function. */
    mockRestore(): void
    /**
     * Sets a new implementation for the mock function.
     * @param newImplementation The new function to use as the mock's implementation.
     */
    mockImplementation(newImplementation: (...args: any[]) => any): ReturnType<typeof fn<T>>
    /**
     * Sets a one-time implementation for the mock function.
     * @param newImplementation The function to use for the next call.
     */
    mockImplementationOnce(newImplementation: (...args: any[]) => any): ReturnType<typeof fn<T>>
    /**
     * Sets a name for the mock function, useful for debugging.
     * @param name The name to assign to the mock function.
     */
    mockName(name: string): this
    /**
     * Configures the mock function to return `this` for all calls.
     */
    mockReturnThis(): this
    /**
     * Configures the mock function to return a specific value for all calls.
     * @param value The value to return.
     */
    mockReturnValue(value: any): this
    /**
     * Configures the mock function to return a specific value for the next call.
     * @param value The value to return for the next call.
     */
    mockReturnValueOnce(value: any): this
    /**
     * Configures the mock function to return a resolved promise with a specific value for all calls.
     * @param value The value to resolve with.
     */
    mockResolvedValue(value: any): this
    /**
     * Configures the mock function to return a resolved promise with a specific value for the next call.
     * @param value The value to resolve with for the next call.
     */
    mockResolvedValueOnce(value: any): this
    /**
     * Configures the mock function to return a rejected promise with a specific value for all calls.
     * @param value The value to reject with.
     */
    mockRejectedValue(value: any): this
    /**
     * Configures the mock function to return a rejected promise with a specific value for the next call.
     * @param value The value to reject with for the next call.
     */
    mockRejectedValueOnce(value: any): this
    /**
     * Executes a callback with a temporary implementation for the mock function.
     * @param fn The temporary implementation.
     * @param callback The function to execute with the temporary implementation.
     */
    withImplementation(fn: (...args: any[]) => any, callback: () => any): this
}

/**
 * Creates a mock function that can track calls, arguments, and return values.
 * It provides a flexible API for controlling the mock's behavior during tests.
 * @template T The type of the function to mock.
 * @param initialImplementation Optional: The initial function to use as the mock's implementation.
 * @returns A `MockedFunction` instance.
 */
export function fn<T extends (...args: any[]) => any>(initialImplementation?: T): MockedFunction<T> {
    let mockImplementationOnceFns: ((...args: any[]) => any)[] = []
    let mockReturnValueOnceValues: any[] = []

    const mockFn = function (this: any, ...args: any[]): any {
        if (new.target) { // Called with 'new'
            (mockFn as MockedFunction<T>).mock.instances.push(this);
            (mockFn as MockedFunction<T>).mock.calls.push(args)

            if (initialImplementation) {
                initialImplementation.apply(this, args)
            }
        } else { // Called as a regular function
            (mockFn as MockedFunction<T>).mock.calls.push(args)
            try {
                let result: any
                if (mockImplementationOnceFns.length > 0) {
                    result = mockImplementationOnceFns.shift()!(...args)
                } else if (mockReturnValueOnceValues.length > 0) {
                    result = mockReturnValueOnceValues.shift()
                } else {
                    result = initialImplementation
                        ? initialImplementation(...args)
                        : undefined
                }

                (mockFn as MockedFunction<T>).mock.results.push({ type: 'return', value: result })
                return result
            } catch (error) {
                (mockFn as MockedFunction<T>).mock.results.push({ type: 'throw', error: error })
                throw error
            }
        }
    } as MockedFunction<T>

    mockFn.prototype = {} // Make it new-able

    Object.assign(mockFn, {
        isMockFunction: true,
        mock: {
            name: '',
            calls: [] as any[][],
            instances: [] as any[],
            results: [] as { type: 'return' | 'throw', value?: any, error?: any }[],
        },
        mockClear() {
            this.mock.calls = []
            this.mock.instances = []
            this.mock.results = []
            mockImplementationOnceFns = []
            mockReturnValueOnceValues = []
        },
        mockReset() {
            this.mockClear()
            initialImplementation = undefined
            mockImplementationOnceFns = []
            mockReturnValueOnceValues = []
        },
        mockRestore() {
            this.mock.calls = []
            this.mock.instances = []
            this.mock.results = []
            mockImplementationOnceFns = []
            mockReturnValueOnceValues = []
        },
        mockImplementation(newImplementation: (...args: any[]) => any) {
            initialImplementation = newImplementation as any
            return this
        },
        mockImplementationOnce(newImplementation: (...args: any[]) => any) {
            mockImplementationOnceFns.push(newImplementation)
            return this
        },
        mockName(name: string) {
            // In a real scenario, this name would be used in error messages or debugging output.
            // For this mock, we'll just return `this` to allow chaining.
            this.mock.name = name
            return this
        },
        mockReturnThis() {
            initialImplementation = (() => this) as T
            return this
        },
        mockReturnValue(value: any) {
            initialImplementation = (() => value) as T
            return this
        },
        mockReturnValueOnce(value: any) {
            mockReturnValueOnceValues.push(value)
            return this
        },
        mockResolvedValue(value: any) {
            initialImplementation = (() => Promise.resolve(value)) as T
            return this
        },
        mockResolvedValueOnce(value: any) {
            mockImplementationOnceFns.push(() => Promise.resolve(value))
            return this
        },
        mockRejectedValue(value: any) {
            initialImplementation = (() => Promise.reject(value)) as T
            return this
        },
        mockRejectedValueOnce(value: any) {
            mockImplementationOnceFns.push(() => Promise.reject(value))
            return this
        },
        withImplementation(fn: (...args: any[]) => any, callback: () => any) {
            const originalImplementation = initialImplementation
            initialImplementation = fn as T
            try {
                const result = callback()
                if (result && typeof (result as any).then === 'function') {
                    return (result as any).then((res: any) => {
                        initialImplementation = originalImplementation
                        return res
                    })
                } else {
                    return result
                }
            } finally {
                if (!(typeof (callback() as any)?.then === 'function')) {
                    initialImplementation = originalImplementation
                }
            }
        }
    })

    Object.defineProperty(mockFn.mock, 'lastCall', {
        get: () => (mockFn as MockedFunction<T>).mock.calls[(mockFn as MockedFunction<T>).mock.calls.length - 1]
    })
    Object.defineProperty(mockFn, 'name', {
        get: () => (mockFn as MockedFunction<T>).mock.name
    })

    return mockFn as MockedFunction<T>
}

/**
 * Checks if a given function is a `MockedFunction`.
 * @template T The type of the `MockedFunction`.
 * @param fn The function to check.
 * @returns `true` if the function is a `MockedFunction`, `false` otherwise.
 */
export const isMockFunction = <T extends ReturnType<typeof fn>>(fn: T | any): fn is ReturnType<typeof fn> => fn.isMockFunction