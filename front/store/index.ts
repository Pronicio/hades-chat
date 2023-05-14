import { defineStore } from "pinia";

export const useMainStore = defineStore('main', () => {
    const ws = ref()
    return { ws }
})
