import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  // Tell vite that assets will be served at domain/kellystocksimulator/* (since we're deploying on gh-pages, cdeevfrr.github.io/repoName/.....)
  base: '/kellystocksimulator/', 
})
