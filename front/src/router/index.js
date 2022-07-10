import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/:catchAll(.*)',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        beforeEnter: (to, from, next) => {
            let auth = localStorage.getItem('name') || sessionStorage.getItem('name')
            if (!auth) return next({ name: 'Connect' })
            next()
        }
    },
    {
        path: '/connect',
        name: 'Connect',
        component: () => import('../views/Connect.vue'),
        beforeEnter: (to, from, next) => {
            let auth = localStorage.getItem('name') || sessionStorage.getItem('name')
            if (auth) return next({ name: 'Home' })
            next()
        }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})
export default router
