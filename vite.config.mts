import { defineConfig } from 'vite'
import * as path from 'path'
import tailwindcss from '@tailwindcss/vite'

/* MAIN */

const config = defineConfig({
    resolve: {
        alias: {
            "~": path.resolve(__dirname, "./src"),
            // 'woby/jsx-dev-runtime': process.argv.includes('dev') ? path.resolve('../woby/src/jsx/runtime.ts') : 'woby/jsx-dev-runtime',
            // 'woby/jsx-runtime': process.argv.includes('dev') ? path.resolve('../woby/src/jsx/runtime.ts') : 'woby/jsx-runtime',
            // 'woby': process.argv.includes('dev') ? path.resolve('../woby/src') : 'woby',
            'woby/jsx-dev-runtime': process.argv.includes('dev') ? path.resolve('../woby/src/jsx/runtime') : 'woby',
            'woby/jsx-runtime': process.argv.includes('dev') ? path.resolve('../woby/src/jsx/runtime') : 'woby',
            'woby': process.argv.includes('dev') ? path.resolve('../woby/src') : 'woby',

            'package.json': path.resolve(__dirname, './package.json'),
            '@woby/chk': process.argv.includes('dev') ? path.resolve('./src') : 'chk',
            // Ensure local plugin resolves correctly in monorepo
            // 'vite-plugin-snapshot': path.resolve(__dirname, '../vite-plugin-snapshot/index.mjs'),
        },
    },
    plugins: [tailwindcss() as any],
    build: {
        rollupOptions: {
            external: ['woby', 'woby/jsx-runtime', 'oby', 'woby/jsx-runtime', 'happy-dom'],
            output: {
                globals: {
                    'woby': 'woby',
                    'woby/jsx-runtime': 'woby/jsx-runtime',
                }
            }
        },
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: './src/index.ts',
            name: 'index',
            // the proper extensions will be added
            fileName: 'index',
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
})

/* EXPORT */

export default config