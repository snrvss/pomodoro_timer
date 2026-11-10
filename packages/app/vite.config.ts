import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { srcAlias } from '../../vite-plugin-src-alias'

// https://vite.dev/config/
export default defineConfig({
  // `@/…` → src of the package that contains the importing file (app, core or infrastructure).
  // Replaces the old fixed `@` alias, which would send core's `@/…` imports into the app's src.
  plugins: [srcAlias(), vue(), vueDevTools()],
})
