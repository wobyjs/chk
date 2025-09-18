// Import happy-dom
import { Window as HappyWindow } from "happy-dom"
import { Command } from 'commander'
import path from "node:path"

// Create a happy-dom window
const window = new HappyWindow({
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
    } catch (error: any) {
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
        } catch (error: any) {
            console.log(`⚠️ Could not process ${prop}: ${error.message}`)
        }
    })

    // console.log("✅ Property enumeration and assignment completed successfully")
} catch (error: any) {
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

import { type Checks as ChecksType } from '../checks'

declare module 'happy-dom' {
    interface Window {
        checks: ChecksType
    }
}


console.log("Happy-dom environment setup complete")

// Main application function
async function run() {
    const checks = await import('../checks')
    const { Checks } = checks

    // Initialize the global `checks` instance if it doesn't already exist.
    if (typeof window !== 'undefined' && !window.checks)
        window.checks = new Checks()

    try {
        console.log("Importing @woby/chk module...")

        // Import @woby/chk
        const checks = await import('../checks')

        console.log("✅ @woby/chk imported successfully")

        // Create a few simple tests
        console.log("🧪 Creating simple tests...")

        // Load and run tests from command line arguments or sample.test.tsx as fallback
        try {
            // Set up Commander.js for argument parsing
            const program = new Command()

            program
                .name('chk')
                .description('CLI to run @woby/chk tests')
                .argument('[files...]', 'test files to run')
                .option('-w, --watch', 'watch files for changes')
                .option('-v, --verbose', 'output verbose logging')
                .action(async (files, options) => {
                    if (files.length > 0) {
                        console.log("Importing test files from arguments...")
                        // Import each file
                        for (const file of files) {
                            console.log(`Importing ${file}...`)
                            try {
                                // Use dynamic import - let Node.js/Deno resolve the path
                                const app = await import(file)
                                console.log("loaded...", file, app)
                            } catch (error) {
                                console.error(`Failed to import ${file}:`, error)
                            }
                        }
                    } else {
                        // If no files provided, import our sample test
                        console.log("Importing default test file...")
                        try {
                            // Try different paths to import the sample test
                            const pathsToTry = [
                                '../../../example/src/sample.test.ts',
                                './example/src/sample.test.ts',
                                '../example/src/sample.test.ts'
                            ]

                            let imported = false
                            for (const path of pathsToTry) {
                                try {
                                    const app = await import(path)
                                    console.log(`✅ Default test file imported successfully from ${path}`)
                                    imported = true
                                    break
                                } catch (error) {
                                    // Continue trying other paths
                                }
                            }

                            if (!imported) {
                                console.error("❌ Failed to import default test file from any path")
                            }
                        } catch (error) {
                            console.error("❌ Failed to import default test file:", error)
                        }
                    }
                })

            // Parse command line arguments (assuming Node.js environment)
            const args = process.argv.slice(2)

            await program.parseAsync(args, { from: 'user' })

            console.log("✅ Test file(s) imported successfully")
        } catch (error: any) {
            console.error("❌ Failed to import test file(s):", error)
        }

        console.log("✅ Tests created successfully")

        console.log("🚀 Creating Checks instance and running tests...")

        // Use the global checks instance that was populated when importing sample.test.tsx
        if (typeof window !== 'undefined' && window.checks) {
            await window.checks.run({ head: false, noLocation: true })
        } else {
            console.log("❌ Global checks instance not found")
        }


    } catch (error) {
        console.error("💥 Error in run function:", error)
    }
}

console.log("🚀 Starting Deno console test runner...")


// console.log('HTMLElement', HTMLElement.prototype)

// Run the application
run().catch(console.error)