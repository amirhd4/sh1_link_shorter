// workbox-config.cjs
module.exports = {
  globDirectory: "dist/",
  globPatterns: [
    "**/*.{html,js,css,png,svg,ico,json}"
  ],
  swDest: "dist/sw.js",
  navigateFallback: "/index.html",
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
      handler: 'CacheFirst',
      options: { cacheName: 'images-cache', expiration: { maxEntries: 60, maxAgeSeconds: 30*24*60*60 } }
    },
    {
      urlPattern: /^https:\/\/your-api-domain\.com\/.*$/,
      handler: 'NetworkFirst',
      options: { cacheName: 'api-cache', networkTimeoutSeconds: 3 }
    }
  ]
};
