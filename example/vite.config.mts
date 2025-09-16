import { defineConfig, PluginOption } from 'vite'
import { snapshotPlugin } from 'vite-plugin-snapshot'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    root: __dirname,
    plugins: [snapshotPlugin() as any as PluginOption, tailwindcss() as any as PluginOption],
    resolve: {
        alias: {
            // "~": path.resolve(__dirname, "./src"),
            // 'woby/jsx-dev-runtime': process.argv.includes('dev') ? path.resolve('../../@woby/woby/src/jsx/runtime') : 'woby',
            // 'woby/jsx-runtime': process.argv.includes('dev') ? path.resolve('../../@woby/woby/src/jsx/runtime') : 'woby',
            // 'woby': process.argv.includes('dev') ? path.resolve('../../@woby/woby/src') : 'woby',
            'package.json': path.resolve(__dirname, './package.json'),
            // Ensure local plugin resolves correctly in monorepo
            'vite-plugin-snapshot': process.argv.includes('dev') ? path.resolve(__dirname, '../../vite-plugin-snapshot/index.js') : 'vite-plugin-snapshot',
            // 'chk/dist': process.argv.includes('dev') ? ('./node_modules/chk/dist') : 'chk/dist',
            // 'chk': process.argv.includes('dev') ? path.resolve('../src') : 'chk',
        },
    },

    build: {
        minify: false,
        outDir: 'dist',
        emptyOutDir: true,

        // rollupOptions: {
        //     external: ['woby', 'woby/jsx-runtime', 'oby', 'woby/jsx-runtime'],
        //     output: {
        //         globals: {
        //             'woby': 'woby',
        //             'woby/jsx-runtime': 'woby/jsx-runtime',
        //         }
        //     }
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: './index.html',
            name: 'index',
            // the proper extensions will be added
            fileName: 'index',
        },
    },

    esbuild: {
        jsx: 'automatic',
    },
    server: {
        port: 5174,
        watch: {
            ignored: ['**/.snapshots/**']
        }
    },
})