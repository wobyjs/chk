/** jsxImportSource woby */

import { Command } from 'commander'
import path from "node:path"
import { type Checks as ChecksType } from '../checks'
import { Chk } from '../chk'
import { Window } from 'happy-dom'

declare module 'happy-dom' {
    interface Window {
        checks: ChecksType
    }
}

// Main application function
export default async function run() {
    const checks = await import('../checks')

    const { Checks } = checks

    // Initialize the global `checks` instance if it doesn't already exist.
    if (typeof window !== 'undefined' && !window.checks)
        window.checks = new Checks()

    try {
        console.log("Importing @woby/chk module...")

        // Import @woby/chk
        const checksModule = await import('../checks')

        console.log("✅ @woby/chk imported successfully")

        // Create a few simple tests
        console.log("🧪 Creating simple tests...")

        try {
            // Set up Commander.js for argument parsing
            const program = new Command()

            program
                .name('chk')
                .description('CLI to run @woby/chk tests')
                .argument('[files...]', 'test files to run (supports glob patterns like *.test.ts)')
                .option('-w, --watch', 'watch files for changes')
                .option('-v, --verbose', 'output verbose logging')
                .option('-i, --interactive', 'interactive mode for snapshot testing')
                .action(async (files, options) => {
                    // If no files specified, find and run all *.test.* files including HTML
                    if (files.length === 0) {
                        console.log("No test files specified. Finding all *.(test|spec).* files...")
                        files = await findTestFiles()
                        if (files.length === 0) {
                            console.log("No test files found.\n")
                            console.log("Usage examples:")
                            console.log("  chk src/example.test.ts              # Run a specific test file")
                            console.log("  chk src/*.test.ts                   # Run all .test.ts files in src directory")
                            console.log("  chk src/**/*.test.ts                # Run all .test.ts files recursively")
                            console.log("  chk src/*nent*.test.*               # Run files matching pattern *nent*.test.*")
                            console.log("  chk src/components.test.html        # Run a specific HTML test file")
                            console.log("\nNote: Glob patterns are expanded by your shell. In some environments,")
                            console.log("      you may need to quote patterns to prevent shell expansion.")
                            return
                        }
                        console.log(`Found ${files.length} test file(s):`, files)
                    } else {
                        // Expand glob patterns if any are provided
                        files = await expandGlobPatterns(files)
                        if (files.length === 0) {
                            console.log("No test files matched the provided patterns.")
                            return
                        }
                        console.log(`Found ${files.length} test file(s) matching patterns:`, files)
                    }

                    // Import each file
                    for (const file of files) {
                        try {
                            // Convert file path to file URL for Deno compatibility
                            console.log(`Importing ${file}...`)
                            const fileUrl = pathToFileURL(file)

                            // Check if it's a component test file based on extension
                            if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
                                // For component files, import and wrap components with Chk
                                const module = await import(fileUrl.href)
                                // console.log(`Loaded component module: ${file}`)

                                // Process each exported component
                                for (const [name, Component] of Object.entries(module)) {
                                    // Skip non-component exports
                                    if (typeof Component !== 'function') continue

                                    // console.log(`Processing component: ${name}`, Component)

                                    try {
                                        const { render } = await import('woby')
                                        const container = document.createElement('div')

                                        // Render with the exact props from your request
                                        render(
                                            <Chk name={name}>
                                                <Component />
                                            </Chk>,
                                            container
                                        )

                                    } catch (wrapError) {
                                        console.error(`Failed to wrap component ${name}:`, wrapError)
                                    }
                                }
                            } else if (file.endsWith('.html')) {
                                // For HTML files with custom elements, parse and process them
                                await processHtmlFile(file)
                            } else {
                                // For regular test files, use dynamic import
                                const app = await import(fileUrl.href)
                                // console.log("loaded...", file, app)
                            }
                        } catch (error) {
                            console.error(`Failed to import ${file}:`, error)
                        }
                    }

                    // Run tests with the provided options
                    console.log("✅ Test file(s) imported successfully")
                    console.log("✅ Tests created successfully, running tests...")
                    await window.checks.run({ head: false, noLocation: true, interactive: options.interactive || false })
                    console.log("🚀 Tests completed!")
                })

            // Parse command line arguments (assuming Node.js environment)
            const args = process.argv.slice(2)

            await program.parseAsync(args, { from: 'user' })
        } catch (error: any) {
            console.error("❌ Failed to import test file(s):", error)
        }
    } catch (error) {
        console.error("💥 Error in run function:", error)
    }
}

// Helper function to convert path to file URL
function pathToFileURL(filePath: string): URL {
    // If it's already a URL, return it
    if (filePath.startsWith('file://') || filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return new URL(filePath)
    }

    // Convert relative path to absolute path
    const absolutePath = path.resolve(filePath)

    // Convert to file URL
    return new URL(`file:///${absolutePath.replace(/\\/g, '/')}`)
}

// Helper function to find all test files recursively
async function findTestFiles(): Promise<string[]> {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')

    const testFiles: string[] = []
    const directoriesToScan = ['src'] // Start with src directory

    // Check if src directory exists
    try {
        await fs.access('src')
    } catch {
        // If src doesn't exist, scan current directory
        directoriesToScan[0] = '.'
    }

    for (const dir of directoriesToScan) {
        await scanDirectory(dir, testFiles)
    }

    return testFiles
}

// Recursive function to scan directories for test files
async function scanDirectory(dir: string, testFiles: string[]): Promise<void> {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')

    try {
        const entries = await fs.readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)

            if (entry.isDirectory()) {
                // Recursively scan subdirectories
                await scanDirectory(fullPath, testFiles)
            } else if (entry.isFile() && (/\.(test|spec)\.(ts|tsx|js|jsx|html)$/.test(entry.name))) {
                // Add test files matching the pattern *.(test|spec).ts* or *.html
                testFiles.push(fullPath)
            }
        }
    } catch (error) {
        console.warn(`Could not scan directory ${dir}:`, error)
    }
}

// Function to expand glob patterns
async function expandGlobPatterns(patterns: string[]): Promise<string[]> {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')

    const expandedFiles: string[] = []

    for (const pattern of patterns) {
        // If it's a simple file path (no glob patterns), add it directly
        if (!pattern.includes('*') && !pattern.includes('?') && !pattern.includes('[')) {
            try {
                // Check if file exists
                await fs.access(pattern)
                expandedFiles.push(pattern)
            } catch {
                console.warn(`%cFile not found: %c${pattern}`, 'color: #FA7C7A', '')
            }
            continue
        }

        // Handle glob patterns with simple matching
        const files = await findFilesMatchingPattern(pattern)
        expandedFiles.push(...files)
    }

    // Remove duplicates
    return [...new Set(expandedFiles)]
}

// Simple glob pattern matching function
async function findFilesMatchingPattern(pattern: string): Promise<string[]> {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')

    // Convert glob pattern to regex
    const regexPattern = pattern
        .replace(/\./g, '\\.')      // Escape dots
        .replace(/\*/g, '.*')       // Convert * to .*
        .replace(/\?/g, '.')        // Convert ? to .
        .replace(/\//g, '[/\\\\]')  // Convert / to [/\\]

    const regex = new RegExp(regexPattern)

    // Find all files recursively
    const allFiles = await findAllFiles('.')

    // Filter files matching the pattern
    return allFiles.filter(file => regex.test(file) && /\.(test|spec)\.(ts|tsx|js|jsx|html)$/.test(file))
}

// Find all files recursively
async function findAllFiles(dir: string): Promise<string[]> {
    const fs = await import('node:fs/promises')
    const path = await import('node:path')

    const files: string[] = []

    try {
        const entries = await fs.readdir(dir, { withFileTypes: true })

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)

            if (entry.isDirectory()) {
                // Recursively scan subdirectories
                const subFiles = await findAllFiles(fullPath)
                files.push(...subFiles)
            } else if (entry.isFile()) {
                files.push(fullPath)
            }
        }
    } catch (error) {
        console.warn(`Could not scan directory ${dir}:`, error)
    }

    return files
}

// Helper function to process HTML files with custom elements
async function processHtmlFile(filePath: string): Promise<void> {
    try {
        const fs = await import('node:fs/promises')
        const pathModule = await import('node:path')

        // First, try to import the corresponding TSX file to register custom elements
        const tsxFilePath = filePath.replace(/\.html$/, '.tsx')
        try {
            // Check if the TSX file exists before trying to import it
            try {
                await fs.access(tsxFilePath)
                // Convert file path to file URL for Deno compatibility
                const fileUrl = pathToFileURL(tsxFilePath)
                await import(fileUrl.href)
                console.log(`Imported corresponding TSX file: ${tsxFilePath}`)
            } catch {
                console.log(`No corresponding TSX file found for ${filePath}`)
            }
        } catch (importError: any) {
            console.warn(`Could not import corresponding TSX file ${tsxFilePath}:`, importError.message)
        }

        // Read the HTML file
        const htmlContent = await fs.readFile(filePath, 'utf-8')

        // Create a happy-dom window and set the content
        const happyWindow = new Window({
            url: "file://" + pathModule.resolve(filePath).replace(/\\/g, '/'),
            settings: {
                disableJavaScriptFileLoading: true,
                disableCSSFileLoading: true,
                enableFileSystemHttpRequests: true
            }
        })

        // Set the document content directly
        happyWindow.document.documentElement.innerHTML = htmlContent

        // Find all woby-chk elements (custom element name for <chk>)
        const chkElements = happyWindow.document.querySelectorAll('woby-chk')

        for (let i = 0; i < chkElements.length; i++) {
            const chkElement = chkElements[i]

            // Get the first child element which should be our custom element
            const customElement = chkElement.firstElementChild
            if (!customElement) continue

            // Create a unique name for this test
            const testName = `${pathModule.basename(filePath, '.html')}/${customElement.tagName.toLowerCase()}-${i}`

            try {
                // Wait for the custom element to be defined
                await customElements.whenDefined(customElement.tagName.toLowerCase())

                // Create a container for rendering using the global document
                const container = document.createElement('div')

                // Create the HTML string representation of the custom element with its attributes
                let elementHtml = `<${customElement.tagName.toLowerCase()}`
                for (let j = 0; j < customElement.attributes.length; j++) {
                    const attr = customElement.attributes[j]
                    elementHtml += ` ${attr.name}="${attr.value}"`
                }
                elementHtml += `></${customElement.tagName.toLowerCase()}>`

                // Set the innerHTML of the container to create the element with proper upgrade
                container.innerHTML = elementHtml
                const newElement = container.firstElementChild as Element

                // Render the chk wrapper with the new custom element
                const { render } = await import('woby')
                render(
                    <Chk name={testName}>
                        {newElement}
                    </Chk>,
                    container
                )

                console.log(`[Chk Dev Mode] Registered/Updated snapshot test for '${testName}'`)
            } catch (renderError) {
                console.error(`Failed to render custom element ${customElement.tagName}:`, renderError)
            }
        }
    } catch (error) {
        console.error(`Failed to process HTML file ${filePath}:`, error)
    }
}
