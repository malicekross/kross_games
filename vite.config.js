import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    base: '/kross_games/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                hello: resolve(__dirname, 'hello-world/index.html'),
                hacking: resolve(__dirname, 'hacking/index.html'),
                war: resolve(__dirname, 'war/index.html'),
            },
        },
    },
})
