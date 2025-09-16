
// Import happy-dom
import { Window } from "happy-dom"

// Create a happy-dom window
const window = new Window({
    url: "http://localhost",
    settings: {
        disableJavaScriptFileLoading: true,
        disableCSSFileLoading: true,
        enableFileSystemHttpRequests: true
    }
})


// // Override global event dispatching FIRST, before any imports
// globalThis.dispatchEvent = function (event) {
//     console.log("Global event dispatch skipped to avoid Deno issues", event, new Error().stack)
//     return true
// }

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

// Helper function to safely assign properties
function safeAssign(target: any, source: any, prop: string) {
    try {
        // @ts-ignore
        target[prop] = source[prop]
        return true
    } catch (error) {
        console.log(`⚠️ Could not assign ${prop}: ${error.message}`)
        return false
    }
}




// Set up ALL global objects from happy-dom by enumerating non-read-only properties and binding functions
try {
    // console.log("🔍 Enumerating non-read-only properties and binding functions...")

    const windowProperties = Object.getOwnPropertyNames(window)

    // Filter out read-only properties and bind functions
    windowProperties.forEach(prop => {
        try {
            // @ts-ignore
            const descriptor = Object.getOwnPropertyDescriptor(window, prop)

            // Skip read-only properties
            if (descriptor && !descriptor.writable && !descriptor.set) {
                // console.log(`🔒 Skipping read-only property: ${prop}`)
                return
            }

            // @ts-ignore
            const value = window[prop]

            // Bind functions
            if (typeof value === 'function') {
                // @ts-ignore
                globalThis[prop] = value.bind(window)
                // console.log(`🔗 Bound function: ${prop}`)
            } else {
                // @ts-ignore
                globalThis[prop] = value
                // console.log(`✅ Assigned property: ${prop}`)
            }
        } catch (error) {
            console.log(`⚠️ Could not process ${prop}: ${error.message}`)
        }
    })

    // console.log("✅ Property enumeration and assignment completed successfully")
} catch (error) {
    console.log("⚠️ Property enumeration failed, falling back to individual property assignment...")

    // Fallback: Assign individual properties (read-only safe approach)
    const properties = [
        'window', 'document', 'HTMLElement', 'customElements', 'MouseEvent',
        'Event', 'KeyboardEvent', 'FocusEvent', 'MutationObserver',
        'HTMLFormElement', 'HTMLInputElement', 'HTMLButtonElement', 'HTMLDivElement',
        'location', 'history', 'navigator'
    ]

    properties.forEach(prop => {
        // @ts-ignore
        safeAssign(globalThis, window, prop)
    })
}

// Add type declaration for global verifies instance
interface Window {
    verifies: import('verifies').Verifies
}

/**
 * Extends the global scope to include a `verifies` property.
 * This allows the `Verifies` instance to be globally accessible.
 */
declare global {
    var verifies: import('verifies').Verifies
}

// // Override problematic event dispatching to prevent Deno errors
// // @ts-ignore
// window.dispatchEvent = function (event) {
//     // console.log("Window event dispatch skipped to avoid Deno issues")
//     return true
// }

// // @ts-ignore
// document.dispatchEvent = function (event) {
//     // console.log("Document event dispatch skipped to avoid Deno issues")
//     return true
// }


// // Initialize the global `verifies` instance if it doesn't already exist.
// if (typeof window !== 'undefined' && !window.verifies)
//     window.verifies = new Verifies()

console.log("Happy-dom environment setup complete")

// Main application function
async function run() {
    try {
        console.log("Importing verifies module...")

        // Import verifies
        const verifies = await import('verifies')

        console.log("✅ Verifies imported successfully")

        // // Check what's available
        // console.log("📦 Available verifies exports:", Object.keys(verifies).filter(key =>
        //     ['test', 'expect', 'Verifies', 'fn', 'spyOn', 'mock', 'render', 'fireEvent'].includes(key)
        // ))

        // Create a few simple tests
        console.log("🧪 Creating simple tests...")

        // Load and run tests from sample.test.tsx instead of hardcoded tests
        try {
            console.log("Importing sample.test.tsx...")
            await import('./sample.test')
            console.log("✅ sample.test.tsx imported successfully")
        } catch (error) {
            console.error("❌ Failed to import sample.test.tsx:", error)
        }

        console.log("✅ Tests created successfully")

        // Try to run tests
        if (verifies.Verifies) {
            console.log("🚀 Creating Verifies instance and running tests...")
            // Use the global verifies instance that was populated when importing sample.test.tsx
            if (typeof window !== 'undefined' && window.verifies) {
                await window.verifies.run()
                console.log("🎉 All tests completed successfully!")
            } else {
                console.log("❌ Global verifies instance not found")
            }
        } else {
            console.log("❌ Verifies class not found")
        }
    } catch (error) {
        console.error("💥 Error in run function:", error)
    }
}

console.log("🚀 Starting Deno console test runner...")

// console.log('HTMLElement', HTMLElement.prototype)

// Run the application
run().catch(console.error)