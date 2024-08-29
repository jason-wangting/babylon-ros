import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'URDFLoader',
      fileName: 'urdf-loader',
      formats: ['es', 'umd']
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
