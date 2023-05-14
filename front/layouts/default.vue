<template>
    <header>
        <div class="brand">
            <div class="logo"></div>
            <h1>Hades-chat</h1>
        </div>
    </header>
    <main>
        <aside>
            <h3>Contacts :</h3>
            <div class="contacts">
                <div class="contact" v-for="contact in contacts" :key="contact.id">
                    <img :src="contact.avatar" :alt="`${contact.username}'s avatar.`" width="75">
                    <div class="infos">
                        <h4>{{ contact.username }}</h4>
                    </div>
                </div>
            </div>
        </aside>
        <slot></slot>
        <aside></aside>
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
        badge: { who: "you", status: "send" }
    },
    {
        id: "b40e9721-9021-403b-bbe8-08eb253077c1",
        username: "Alice",
        avatar: "https://i.imgur.com/XfCyTdg.jpeg",
        badge: { who: "it", status: "unread", data: 3 }
    },
    {
        id: "93ff0ca6-fe24-4cf6-91f0-bc996f53578b",
        username: "Chris",
        avatar: "https://i.imgur.com/qnT4TJZ.png",
        badge: { who: "it", status: "read", data: 5 }
    },
    {
        id: "b6b22914-e80e-4b69-9f18-937111582def",
        username: "John",
        avatar: "https://i.imgur.com/M0xD1by.png",
        badge: { who: "it", status: "miss-call" }
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
