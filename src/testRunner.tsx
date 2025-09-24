/**
 * @file Dynamically loads and runs all *.test.ts files in the project
 * This is the entry point for running tests in the browser environment
 */

import { render, } from 'woby'
import { Checks } from './checks'
import { normalizeComponentName } from './utils'
import { Chk } from './chk'
// import { Checks, Chk, normalizeComponentName} from './index'

// Initialize the global chk instance if it's not already
if (!window.checks) {
    window.checks = new Checks()
}

// Dynamically import all test files using the Vite-defined environment variable
export async function loadTestFiles(testFiles: string[]) {
    console.log('Loading test files...')

    // Use the test files defined in vite.config.mts (found using glob)
    // const testFiles: string[] = __TEST_FILES__

    // Debug: log the actual paths
    console.log('Test files from Vite define:', testFiles)

    // Load each test file dynamically
    const testModules: Record<string, Record<string, any>> = {}

    for (const filePath of testFiles) {
        try {
            // The filePath is already relative to the example directory, so we can use it directly
            // Prepend with './' to make it explicitly relative
            const importPath = `./${filePath}`

            console.log('Attempting to import:', importPath)
            testModules[filePath] = await import(/* @vite-ignore */ importPath)
        } catch (error) {
            console.error(`Failed to load test file ${filePath}:`, error)
        }
    }

    console.log(`Loaded ${Object.keys(testModules).length} test modules`)
    return testModules
}

// Render components from all test modules that export components
export async function renderTestComponents(testModules: Record<string, Record<string, any>>) {
    try {
        // Collect all components from all test modules
        const allComponentElements: any[] = []

        // Process all test modules
        for (const [modulePath, module] of Object.entries(testModules)) {
            // Get all exported components from this module
            const componentExports = Object.keys(module)

            console.log(`Rendering components from ${modulePath}:`, componentExports)

            // Create component elements for this module
            const componentElements = componentExports
                .filter((exportName: string) => typeof (module as any)[exportName] === 'function')
                .map((exportName: string, index: number) => {
                    const Component = (module as any)[exportName]
                    const componentName = normalizeComponentName(`${modulePath}/${exportName}`)

                    // Using jsx function for Chk component
                    return (
                        <Chk name={componentName}>
                            <Component />
                        </Chk>
                    )
                })

            // Add this module's components to the overall collection
            allComponentElements.push(
                componentExports.length === 0 ? <div class="pl-4 font-bold text-white bg-black">TS file: {modulePath} (F12, see console logging)</div>
                    : <div class="pl-4 font-bold text-white bg-black">TSX file: {modulePath}</div>,
                ...componentElements)
        }

        // Render all components in a single render call
        const container = document.getElementById('test-container')
        if (container) {
            render(allComponentElements, container)
        }

        return container
    } catch (error) {
        console.error('Error loading test components:', error)
        const container = document.getElementById('test-container')
        if (container) {
            container.innerHTML = '<p>Error loading test components. Check console for details.</p>'
        }
        return container
    }
}


export function runTests() {
    // Run the tests after a short delay to allow components to register
    setTimeout(async () => {
        console.log("Loading and running tests...")
        try {
            // Run all registered tests
            window.checks.run({ head: false, noLocation: true, interactive: false })
        } catch (error) {
            console.error('Error running tests:', error)
        }
    }, 500)
}