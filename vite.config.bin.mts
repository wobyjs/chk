import { defineConfig } from 'vite'
import * as path from 'path'
import { copyFileSync, mkdirSync } from 'fs'

/* BIN CONFIGURATION */

const config = defineConfig({
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "./"),
            'package.json': path.resolve(__dirname, '../package.json'),
        },
    },
    build: {
        outDir: './dist',
        emptyOutDir: false, // Don't empty the main dist directory
        rollupOptions: {
            external: ['happy-dom'],
            output: {
                entryFileNames: 'bin/[name].js',
            },
            input: {
                chk: path.resolve(__dirname, 'src/bin/chk.ts')
            },
            plugins: [{
                name: 'copy-bin-file',
                writeBundle() {
                    try {
                        // Create dist/bin directory if it doesn't exist
                        mkdirSync(path.resolve(__dirname, 'dist', 'bin'), { recursive: true })

                        // Copy the source bin file to dist/bin
                        const srcPath = path.resolve(__dirname, 'src', 'bin', 'chk.ts')
                        const destPath = path.resolve(__dirname, 'dist', 'bin', 'chk.ts')
                        copyFileSync(srcPath, destPath)
                        console.log('✅ Copied bin file to dist/bin/chk.ts')
                    } catch (error) {
                        console.error('❌ Failed to copy bin file:', error)
                    }
                }
            }]
        },
        lib: {
            entry: './src/bin/chk.ts',
            name: 'chk',
            fileName: 'bin/chk',
            formats: ['cjs']
        },
    },
})

/* EXPORT */

export default config