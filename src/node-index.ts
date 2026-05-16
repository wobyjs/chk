/**
 * @file Node.js specific entry point for @woby/chk
 * This file sets up the SSR environment before exporting the main library
 */

// MUST run BEFORE any other code executes
if (typeof window === 'undefined' && typeof globalThis !== 'undefined') {
    // We're in Node.js - setup minimal environment
    ;(globalThis as any).window = globalThis
    ;(globalThis as any).isDeno = true
    
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
}

// Now safe to import - environment is set up
import * as main from './index'

// Re-export everything
export * from './index'
