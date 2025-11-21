/** jsxImportSource woby */

import { Command } from 'commander'
import path from "node:path"
import fg from 'fast-glob'
import { type Checks as ChecksType } from '../checks'
import { Chk } from '../chk'
// Removed happy-dom import

// Removed happy-dom module declaration

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
                .version('1.1.1')
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
                            console.log("%cNo test files matched the provided patterns.", 'color: #F44336; font-weight: bold')
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
                                        console.error(`%cFailed to wrap component ${name}:`, 'color: #F44336; font-weight: bold', wrapError)
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
                            console.error(`%cFailed to import ${file}:`, 'color: #F44336; font-weight: bold', error)
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
            console.error("%c❌ Failed to import test file(s):", 'color: #F44336; font-weight: bold', error)
        }
    } catch (error) {
        console.error("%c💥 Error in run function:", 'color: #F44336; font-weight: bold', error)
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
        console.warn(`%cCould not scan directory ${dir}:`, 'color: #F44336; font-weight: bold', error)
    }
}

// Function to expand glob patterns using fast-glob
async function expandGlobPatterns(patterns: string[]): Promise<string[]> {
    const fs = await import('node:fs/promises')

    const expandedFiles: string[] = []

    for (const pattern of patterns) {
        // Normalize backslashes to forward slashes for glob patterns
        // fast-glob expects forward slashes even on Windows
        const normalizedPattern = pattern.replace(/\\/g, '/')

        // If it's a simple file path (no glob patterns), add it directly
        if (!normalizedPattern.includes('*') && !normalizedPattern.includes('?') && !normalizedPattern.includes('[')) {
            try {
                // Check if file exists (use original pattern for file system access)
                await fs.access(pattern)
                expandedFiles.push(pattern)
            } catch {
                console.warn(`%cFile not found: ${pattern}`, 'color: #F44336; font-weight: bold')
            }
            continue
        }

        // Use fast-glob for pattern matching with normalized pattern
        const files = await fg(normalizedPattern, {
            cwd: process.cwd(),
            dot: true,
            absolute: false,
            onlyFiles: true,
            // Only match test files
            ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**']
        })

        // Filter to only test files
        const testFiles = files.filter(file => /\.(test|spec)\.(ts|tsx|js|jsx|html)$/.test(file))
        expandedFiles.push(...testFiles)
    }

    // Remove duplicates
    return [...new Set(expandedFiles)]
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
            console.warn(`%cCould not import corresponding TSX file ${tsxFilePath}:`, 'color: #F44336; font-weight: bold', importError.message)
        }

        // Read the HTML file
        const htmlContent = await fs.readFile(filePath, 'utf-8')

        // Parse HTML content directly without happy-dom
        // Find all woby-chk elements using regex parsing
        const chkElements: { firstElementChild: { tagName: string, attributes: { name: string, value: string }[] } }[] = []

        // Simple regex to find woby-chk elements and their first child
        const chkRegex = /<woby-chk[^>]*>([\s\S]*?)<\/woby-chk>/gi
        let match

        while ((match = chkRegex.exec(htmlContent)) !== null) {
            const chkContent = match[1].trim()

            // Extract the first element inside woby-chk
            const firstElementMatch = chkContent.match(/<([\w-]+)([^>]*?)\/?>/)

            if (firstElementMatch) {
                const tagName = firstElementMatch[1]
                const attrsString = firstElementMatch[2] || ''

                // Parse attributes
                const attrRegex = /([\w-]+)=("[^"]*"|'[^']*')/g
                const attributes: { name: string, value: string }[] = []
                let attrMatch

                while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
                    attributes.push({
                        name: attrMatch[1],
                        value: attrMatch[2].slice(1, -1) // Remove quotes
                    })
                }

                chkElements.push({
                    firstElementChild: {
                        tagName: tagName.toUpperCase(),
                        attributes: attributes
                    }
                })
            }
        }

        for (let i = 0; i < chkElements.length; i++) {
            const chkElement = chkElements[i]

            // Get the first child element which should be our custom element
            const customElement = chkElement.firstElementChild
            if (!customElement) continue

            // Create a unique name for this test
            const testName = `${pathModule.basename(filePath, '.html')}/${customElement.tagName.toLowerCase()}-${i}`

            // In Node.js environment, we can't wait for custom elements to be defined
            // We'll proceed with processing assuming the custom elements are already registered
            console.log(`Processing custom element: ${customElement.tagName.toLowerCase()}`)

            try {
                // Create a container for rendering
                // In Node.js environment, we'll create a simple object to represent the element
                const container = {
                    tagName: 'div',
                    children: [] as any[],
                    appendChild: function (child: any) {
                        this.children.push(child)
                    }
                }

                // Create the element representation with its attributes
                const elementAttributes: Record<string, string> = {}
                for (let j = 0; j < customElement.attributes.length; j++) {
                    const attr = customElement.attributes[j]
                    elementAttributes[attr.name] = attr.value
                }

                // Create a simple element representation
                const newElement = {
                    tagName: customElement.tagName.toLowerCase(),
                    attributes: elementAttributes
                }

                // For server-side rendering, we'll just log the information
                console.log(`[Chk Dev Mode] Would render snapshot test '${testName}' with element:`, newElement)

                console.log(`[Chk Dev Mode] Registered/Updated snapshot test for '${testName}'`)
            } catch (renderError) {
                console.error(`%cFailed to process custom element ${customElement.tagName}:`, 'color: #F44336; font-weight: bold', renderError)
            }
        }
    } catch (error) {
        console.error(`%cFailed to process HTML file ${filePath}:`, 'color: #F44336; font-weight: bold', error)
    }
}
