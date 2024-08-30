import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { peerDependencies } from './package.json';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'URDFLoader',
      fileName: 'urdf-loader',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      external: Object.keys(peerDependencies || {}),
      output: {
        globals: {
          "@babylonjs/core": "BABYLON"
        }
      }
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [
    dts({
      outDir: 'dist',
      insertTypesEntry: true, // 生成 types 字段并添加到 package.json 中
    }),
  ],
});
