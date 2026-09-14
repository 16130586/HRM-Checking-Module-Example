import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    allowedHosts: [
      "nuclear-cupping-expediter.ngrok-free.dev",
    ],
    proxy: {
      "/api": {
        target: "http://localhost:5094",
        changeOrigin: true,
        secure: false,
        xfwd: true,
        configure(proxy) {
          proxy.on("proxyReq", (proxyRequest, request) => {
            const forwardedFor =
              request.headers["x-forwarded-for"] ||
              request.socket.remoteAddress;

            if (forwardedFor) {
              proxyRequest.setHeader(
                "X-Forwarded-For",
                forwardedFor
              );
            }
          });
        },
      },
    },
  },
})