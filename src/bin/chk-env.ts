// Environment setup module for chk
// Uses woby's built-in SSR module instead of happy-dom or other 3rd-party DOM implementations
console.log("Setting up woby SSR environment...")

// Mark as SSR/Deno-like environment (not a browser)
// @ts-ignore
;(globalThis as any).isDeno = true

// Set up minimal non-DOM globals needed for woby's SSR
// @ts-ignore
globalThis.window = globalThis
// @ts-ignore
globalThis.location = { href: 'http://localhost', origin: 'http://localhost' }
// @ts-ignore
globalThis.history = { length: 0, state: null, scrollRestoration: 'auto' }
// @ts-ignore
Object.defineProperty(globalThis, 'navigator', {
    value: {
        userAgent: 'woby-test-runner',
        platform: 'node',
        language: 'en-US'
    },
    writable: true,
    configurable: true
})

// Set up timing functions
// @ts-ignore
globalThis.setTimeout = setTimeout
// @ts-ignore
globalThis.clearTimeout = clearTimeout
// @ts-ignore
globalThis.setInterval = setInterval
// @ts-ignore
globalThis.clearInterval = clearInterval
// @ts-ignore
globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0)
// @ts-ignore
globalThis.cancelAnimationFrame = clearTimeout
// @ts-ignore
globalThis.queueMicrotask = globalThis.queueMicrotask || ((callback: () => void) => Promise.resolve().then(callback))
// @ts-ignore
globalThis.dispatchEvent = () => true

console.log("Woby SSR environment setup complete")

// Export a function to dynamically import and run the main application
export async function runChkApp() {
    // Set the snapshot base directory to the current working directory
    const { setSnapshotBaseDir } = await import('../utils/snapshotUtils')
    setSnapshotBaseDir(process.cwd())

    const mainApp = await import('./chk-app')
    return mainApp.default()
}