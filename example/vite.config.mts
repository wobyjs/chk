import { defineConfig, PluginOption } from 'vite'
import { snapshotPlugin } from 'vite-plugin-snapshot'
import { testPlugin } from '@woby/vite-plugin-test'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'

// Check if we're in dev mode
const isDevMode = process.argv.includes('dev') || (process.argv.includes('--mode') && process.argv.includes('dev'))

export default defineConfig({
    root: __dirname,
    plugins: [
        tailwindcss() as any as PluginOption,
        snapshotPlugin() as any as PluginOption,
        testPlugin() as any as PluginOption,
    ],
    resolve: {
        alias: {
            'package.json': path.resolve(__dirname, './package.json'),
            'vite-plugin-snapshot': isDevMode ? path.resolve(__dirname, '../../vite-plugin-snapshot/index.js') : 'vite-plugin-snapshot',
            '@woby/chk': isDevMode ? path.resolve('../src') : '@woby/chk',
            '@woby/chk/index.css': isDevMode ? path.resolve('../dist/index.css') : '@woby/chk/index.css',
        },
    },

    build: {
        minify: false,
        outDir: 'dist',
        emptyOutDir: true,

        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
            }
        }
    },

    esbuild: {
        jsx: 'automatic',
    },
    server: {
        port: 5174,
        watch: {
            ignored: ['**/.snapshots/**']
        },
        // Allow serving files from the root directory
        fs: {
            allow: ['..', '../../']
        }
    },
})