// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            webSocketApi: "wss://hades-chat-v2.onrender.com/ws" //Dev url : ws://127.0.0.1:9000/ws
        }
    },
    modules: [
        '@pinia/nuxt',
    ],
})
