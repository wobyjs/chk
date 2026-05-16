/**
 * @file This is the main entry point for the `@woby/chk` testing library.
 * It re-exports all public modules, making them easily accessible from a single import.
 */

// Auto-setup SSR environment in Node.js (not needed in browser/Vite)
if (typeof window === 'undefined' && typeof globalThis !== 'undefined') {
    // We're in Node.js - setup minimal environment
    ; (globalThis as any).window = globalThis
        ; (globalThis as any).isDeno = true

    if (!globalThis.location) {
        Object.defineProperty(globalThis, 'location', {
            value: { href: 'http://localhost', origin: 'http://localhost' },
            writable: true,
            configurable: true
        })
    }

    if (!globalThis.navigator) {
        Object.defineProperty(globalThis, 'navigator', {
            value: { userAgent: 'node-chk', platform: 'node', language: 'en-US' },
            writable: true,
            configurable: true
        })
    }

    if (!globalThis.document) {
        let documentTitle = ''
        Object.defineProperty(globalThis, 'document', {
            value: {
                get title() { return documentTitle },
                set title(value) { documentTitle = value },
                createElement: (): any => ({ innerHTML: '', textContent: '', appendChild: () => {} }),
                getElementById: (): any => null,
                querySelector: (): any => null,
                querySelectorAll: (): any[] => [],
                body: { appendChild: (): any => {} },
                head: { appendChild: (): any => {} }
            },
            writable: true,
            configurable: true
        })
    }
}

export * from './checks'
export * from './expect'
// Remove the circular import
// export * from './index'
export * from './match'
export * from './messenger'
export * from './utils'
export * from './utils/snapshotUtils'
// Remove duplicate export
// export * from './checks'
export * from './chk' // Export the Chk component
export * from './snapshotTest' // Export SnapshotTest if it needs to be accessible
export * from './csf'
export * from './fn'
export * from './createMockFromModule'
export * from './mock'
export * from './bind'
export * from './spyOn'
export * from './testContext'

export * from './messengers'
// export * from './test'
export * from './matcher'
export * from './expect.static'
export * from './expect.method'
export * from './testRunner'