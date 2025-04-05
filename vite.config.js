// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig( {
  root: '.', // default is current directory
  server: {
    port: 5173, // you can change this if needed
    open: true, // auto-open in browser
  },
} );
