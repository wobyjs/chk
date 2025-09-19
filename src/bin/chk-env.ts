// Environment setup module for chk
import { Window as HappyWindow } from "happy-dom"

console.log("Setting up happy-dom environment...")

// Create a happy-dom window
const window = new HappyWindow({
    url: "http://localhost",
    settings: {
        disableJavaScriptFileLoading: true,
        disableCSSFileLoading: true,
        enableFileSystemHttpRequests: true
    }
})


    ; (window as any).isDeno = true

// Set up timing functions and all necessary globals for woby
// @ts-ignore
globalThis.document = window.document
// @ts-ignore
globalThis.window = window
// @ts-ignore
globalThis.HTMLElement = window.HTMLElement
// @ts-ignore
globalThis.customElements = window.customElements
// @ts-ignore
globalThis.MouseEvent = window.MouseEvent
// @ts-ignore
globalThis.Event = window.Event
// @ts-ignore
globalThis.KeyboardEvent = window.KeyboardEvent
// @ts-ignore
globalThis.FocusEvent = window.FocusEvent
// @ts-ignore
globalThis.MutationObserver = window.MutationObserver
// @ts-ignore
globalThis.HTMLFormElement = window.HTMLFormElement
// @ts-ignore
globalThis.HTMLInputElement = window.HTMLInputElement
// @ts-ignore
globalThis.HTMLButtonElement = window.HTMLButtonElement
// @ts-ignore
globalThis.HTMLDivElement = window.HTMLDivElement
// @ts-ignore
globalThis.location = window.location
// @ts-ignore
globalThis.history = window.history
// @ts-ignore
Object.defineProperty(globalThis, 'navigator', {
    value: window.navigator,
    writable: true,
    configurable: true
})
// @ts-ignore
globalThis.Node = window.Node

// Set up timing functions (these are usually safe to assign)
// @ts-ignore
globalThis.setTimeout = window.setTimeout.bind(window)
// @ts-ignore
globalThis.clearTimeout = window.clearTimeout.bind(window)
// @ts-ignore
globalThis.setInterval = window.setInterval.bind(window)
// @ts-ignore
globalThis.clearInterval = window.clearInterval.bind(window)
// @ts-ignore
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window)
// @ts-ignore
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window)
// @ts-ignore
globalThis.queueMicrotask = window.queueMicrotask.bind(window)
// @ts-ignore
globalThis.dispatchEvent = window.dispatchEvent.bind(window)
// @ts-ignore
globalThis.fetch = window.fetch.bind(window)

console.log("Happy-dom environment setup complete")
console.log("Document available:", typeof document !== 'undefined')

// Export a function to dynamically import and run the main application
export async function runChkApp() {
    // Set the snapshot base directory to the current working directory
    // This allows snapshots to be saved in the same directory where tests are run
    const { setSnapshotBaseDir } = await import('../utils/snapshotUtils')
    setSnapshotBaseDir(process.cwd())

    const mainApp = await import('./chk-app')
    return mainApp.default()
}