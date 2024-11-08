import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// ----------------------------------------------------------------------

export default defineConfig({
  base: '/learnitor-admin/', // Ensure GitHub Pages serves from the correct subdirectory
  plugins: [
    react(),
    checker({
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
      },
    }),
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: 'build/index.html',
    //       dest: '',
    //       rename: '404.html',  // Copy index.html as 404.html
    //     },
    //   ],
    // }),
  ],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  build: {
    outDir: 'build', // Ensure this matches the deployment command or adjust the script to `gh-pages -d build`
  },
  server: {
    port: 3030,
    historyApiFallback: true,
  },
  preview: {
    port: 3030,
  },
});
