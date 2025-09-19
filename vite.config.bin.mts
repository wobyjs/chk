import { defineConfig } from 'vite'
import * as path from 'path'

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
            }
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