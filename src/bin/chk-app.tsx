/** jsxImportSource woby */

import { Command } from 'commander'
import path from "node:path"
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import { type Checks as ChecksType } from '../checks'
import { Chk } from '../chk'
import { composed } from 'happy-dom/lib/PropertySymbol.js'

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
                    // If no files specified, find and run all *.test.ts* files
                    if (files.length === 0) {
                        console.log("No test files specified. Finding all *.test.ts* files...")
                        files = await findTestFiles()
                        if (files.length === 0) {
                            console.log("No test files found.\n")
                            console.log("Usage examples:")
                            console.log("  chk src/example.test.ts              # Run a specific test file")
                            console.log("  chk src/*.test.ts                   # Run all .test.ts files in src directory")
                            console.log("  chk src/**/*.test.ts                # Run all .test.ts files recursively")
                            console.log("  chk src/*nent*.test.ts*             # Run files matching pattern *nent*.test.ts*")
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
            } else if (entry.isFile() && /\.test\.ts/.test(entry.name)) {
                // Add test files matching the pattern *.test.ts*
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
    return allFiles.filter(file => regex.test(file) && /\.test\.ts/.test(file))
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