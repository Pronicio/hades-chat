<template>
    <main>
        <aside>
            <div class="header">
                <div class="menu-icon"></div>
                <div class="search">
                    <div class="search-icon"></div>
                    <input type="text" placeholder="Search...">
                </div>
            </div>
            <div class="contacts">
                <div class="contact" v-for="contact in contacts" :key="contact.id" :id="contact.active ? 'active' : ''">
                    <img :src="contact.avatar" :alt="`${contact.username}'s avatar.`" width="75">
                    <div class="infos">
                        <h4>{{ contact.username }}</h4>
                        <p>{{ contact.lastTime.message }}</p>
                    </div>
                    <div class="dates">
                        <p>{{ contact.lastTime.time }}</p>
                        <div class="badge" :id="contact.badge?.status">{{ contact.badge?.data }}</div>
                    </div>
                </div>
            </div>
        </aside>
        <slot></slot>
    </main>
</template>

<script setup lang="ts">
import { ContactList } from "~/api/types";
import { cryptoApi } from "~/api/utils";

const contacts: ContactList = <ContactList>[
    {
        id: "345d6825-4514-46af-9ddd-8a3338f240ce",
        username: "Pablo",
        avatar: "https://i.imgur.com/U3yw7ft.jpeg",
        lastTime: {
            message: "You: i don't remember 😄 ",
            time: "18:30"
        },
        badge: null,
        active: false
    },
    {
        id: "b40e9721-9021-403b-bbe8-08eb253077c1",
        username: "Alice",
        avatar: "https://i.imgur.com/XfCyTdg.jpeg",
        lastTime: {
            message: "Ok, see you later",
            time: "18:30"
        },
        badge: { status: "unread", data: 3 },
        active: true
    },
    {
        id: "93ff0ca6-fe24-4cf6-91f0-bc996f53578b",
        username: "Chris",
        avatar: "https://i.imgur.com/qnT4TJZ.png",
        lastTime: {
            message: "I got a job at SpaceX 🎉 🚀  ",
            time: "19:08"
        },
        badge: { status: "read", data: 5 },
        active: false
    },
    {
        id: "b6b22914-e80e-4b69-9f18-937111582def",
        username: "John",
        avatar: "https://i.imgur.com/M0xD1by.png",
        lastTime: {
            message: "Table for four, 5PM. Be there.",
            time: "19:56"
        },
        badge: { status: "miss-call" },
        active: false
    }
]

onBeforeMount(async () => {
    const keys = await cryptoApi.createKeys()
    localStorage.setItem("private", keys.privateKey)
    localStorage.setItem("public", keys.publicKey)

    const pKey = await cryptoApi.importKey(localStorage.getItem("private"), "private")
    console.log(pKey);
})
</script>

<style lang="scss">
@import '../assets/style/style.scss';
</style>

<style scoped lang="scss">
@import '../assets/style/layouts/default.scss';
</style>
