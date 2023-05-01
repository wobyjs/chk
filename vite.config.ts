import { defineConfig } from 'vite'

import { resolve, join } from 'path'

/* MAIN */

const config = defineConfig({
    resolve: {
        alias: {
            "~": resolve(__dirname, "./src"),
        },
    },
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: './src/index.ts',
            name: 'index',
            // the proper extensions will be added
            fileName: 'index',
        },
    },
})

/* EXPORT */

export default config
