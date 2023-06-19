import { defineStore } from "pinia";

export const useMainStore = defineStore('main', () => {
    const ws = ref()
    const currentContact = ref()
    return { ws, currentContact }
})
