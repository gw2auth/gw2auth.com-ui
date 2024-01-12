import { resolve } from 'path';
import { defineConfig, PluginOption, ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
function localTarget(target: string): ProxyOptions {
  return {
    target: target,
    changeOrigin: false,
    headers: {
      'Cloudfront-Viewer-Country': 'DE',
      'Cloudfront-Viewer-City': 'Berlin',
      'Cloudfront-Viewer-Latitude': '52.5162778',
      'Cloudfront-Viewer-Longitude': '13.3755154',
    },
  }
}

const proxyConfig: Record<string, string | ProxyOptions> = {
  '/api/': localTarget('http://127.0.0.1:9000'),
  '/api-v2/': localTarget('http://127.0.0.1:8090'),
  '/api-app/': localTarget('http://127.0.0.1:8090'),
  '/auth/': localTarget('http://127.0.0.1:9000'),
  '/oauth2/': localTarget('http://127.0.0.1:9000'),
  '/.well-known/oauth-authorization-server': localTarget('http://127.0.0.1:9000'),
};

function defaultRootPlugin(): PluginOption {
  return {
    name: 'configure-server',
    configureServer: (server) => {
      server.middlewares.use((req, res, next) => {
        if (!['/', '/@react-refresh', '/@vite/client'].includes(req.url) && !Object.keys(proxyConfig).some((prefix) => req.url.startsWith(prefix))) {
          const index = req.url.lastIndexOf('.');
          if (index === -1) {
            req.url = '/';
          }
        }

        next();
      });
    },
  };
}

export default defineConfig({
  root: resolve(__dirname, 'src/pages'),
  publicDir: resolve(__dirname, 'public'),
  plugins: [react(), defaultRootPlugin()],
  server: {
    port: 4200,
    proxy: proxyConfig,
    /*
    headers: {
      'content-security-policy': [
        'default-src \'self\'',
        'connect-src \'self\'',
        'style-src \'self\' \'unsafe-inline\'',
        'font-src data:',
        'img-src \'self\' https://icons-gw2.darthmaim-cdn.com/ https://static.staticwars.com/quaggans/',
      ].join('; '),
    },
     */
  },
  build: {
    outDir: resolve(__dirname, './dist'),
  },
});
