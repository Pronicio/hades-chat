// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    ssr: false,
    runtimeConfig: {
        public: {
            websocketApi: process.env.WEB_SOCKET_API as string
        }
    },
    modules: [
        '@pinia/nuxt',
        '@vite-pwa/nuxt'
    ],
    pwa: {
        manifest: {
            name: "Hadès-chat",
            short_name: "Hadès-chat",
            start_url: ".",
            display: "standalone",
            background_color: "#171717",
            description: "Chat app",
            icons: [
                {
                    src: 'pwa-192.png',
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: 'pwa-512.png',
                    sizes: '512x512',
                    type: 'image/png',
                },
                {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable',
                },
            ],
        }
    }
})
