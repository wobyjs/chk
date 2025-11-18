// Environment setup module for chk
console.log("Setting up woby environment...")

// Use Node.js built-in queueMicrotask if available, otherwise provide a fallback
const queueMicrotask = globalThis.queueMicrotask || ((callback) => Promise.resolve().then(callback))

    // Mark as Deno environment
    // @ts-ignore
    ; (globalThis as any).isDeno = true

// Set up minimal globals needed for woby
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
globalThis.queueMicrotask = queueMicrotask
// @ts-ignore
globalThis.dispatchEvent = () => true

console.log("Woby environment setup complete")
console.log("GlobalThis available:", typeof globalThis !== 'undefined')

// Export a function to dynamically import and run the main application
export async function runChkApp() {
    // Set the snapshot base directory to the current working directory
    // This allows snapshots to be saved in the same directory where tests are run
    const { setSnapshotBaseDir } = await import('../utils/snapshotUtils')
    setSnapshotBaseDir(process.cwd())

    const mainApp = await import('./chk-app')
    return mainApp.default()
}