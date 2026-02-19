import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                popup: resolve('src/popup/popup.html'),
                harvester: resolve('src/content/harvester.ts'),
                injector_facebook: resolve('src/content/injector_facebook.ts'),
                injector_kijiji: resolve('src/content/injector_kijiji.ts'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
        outDir: 'dist',
        emptyOutDir: true,
    },
});
