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
    ],
})
