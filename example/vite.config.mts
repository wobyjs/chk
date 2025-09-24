import { defineConfig, PluginOption } from 'vite'
import { snapshotPlugin } from 'vite-plugin-snapshot'
import { testPlugin } from 'vite-plugin-test'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { glob } from 'glob'

export default defineConfig({
    root: __dirname,
    plugins: [
        tailwindcss() as any as PluginOption,
        snapshotPlugin() as any as PluginOption,
        testPlugin()
    ],
    resolve: {
        alias: {
            'package.json': path.resolve(__dirname, './package.json'),
            'vite-plugin-snapshot': process.argv.includes('dev') ? path.resolve(__dirname, '../../vite-plugin-snapshot/index.js') : 'vite-plugin-snapshot',
            'chk': process.argv.includes('dev') ? path.resolve('../src') : 'chk',
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