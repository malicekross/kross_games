import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/kross_games/',
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                hello: resolve(__dirname, 'hello-world/index.html'),
                hacking: resolve(__dirname, 'hacking_wars/index.html'),
                war: resolve(__dirname, 'shelter_war/index.html'),
                sprite_forge: resolve(__dirname, 'sprite_forge/index.html'),
                mammoth_lake: resolve(__dirname, 'mammoth_lake/index.html'),
            },

        },
    },
    define: {
        '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
    },
})
