import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const enviroment = process.env.NODE_ENVIROMENT === 'development' ? "http://localhost:5000" : 'https://shopshop.onrender.com'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": enviroment,
      '/uploads': enviroment
    },
  },
  plugins: [react()],
})
