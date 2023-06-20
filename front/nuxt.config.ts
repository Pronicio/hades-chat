// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            webSocketApi: "ws://127.0.0.1:9000/ws"
        }
    },
    modules: [
        '@pinia/nuxt',
    ],
})
