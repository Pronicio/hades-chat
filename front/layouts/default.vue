<template>
  <div id="main" v-if="mounted">
    <main v-if="created">
      <contact></contact>
      <slot></slot>
    </main>
    <section v-else>
      <h1>What is your name ?</h1>
      <form v-on:submit.prevent="registerUser">
        <input type="text" minlength="4" maxlength="24" v-model="username">
        <button type="submit">Validate !</button>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { cryptoApi } from "~/api/utils";
import { ContactList } from "~/api/types";

const created = ref(false)
const mounted = ref(false)

const username = ref()

onBeforeMount(() => {
  const userExist = localStorage.getItem("username")
  const userTokenExist = localStorage.getItem("token")

  if (userExist && userTokenExist) {
    created.value = true;
  }

  mounted.value = true
})

onMounted(() => {
  if (!created.value) {
    (document.getElementById("main") as HTMLElement).style.display = "flex"
  }
})

async function registerUser() {
  if (!username.value) return;

  const regex = /\w{4,24}/g
  const test = regex.exec(username.value)

  if (test) {
    const username = test[0]
    localStorage.setItem("username", username);
    putDefaultsContacts()

    await genKey();

    created.value = true;
    (document.getElementById("main") as HTMLElement).style.display = "block"
  }
}

async function genKey() {
  const keys = await cryptoApi.createKeys()
  localStorage.setItem("private", keys.privateKey)
  localStorage.setItem("public", keys.publicKey)
}

function putDefaultsContacts() {
  localStorage.setItem("contacts", JSON.stringify(<ContactList>[
    {
      username: "Pablo",
      avatar: "https://i.imgur.com/U3yw7ft.jpeg",
      publicKey: "ewogImFsZyI6ICJSU0EtT0FFUC0yNTYiLAogImUiOiAiQVFBQiIsCiAiZXh0IjogdHJ1ZSwKICJrZXlfb3BzIjogWwogICJlbmNyeXB0IgogXSwKICJrdHkiOiAiUlNBIiwKICJuIjogInpsR2ExbVdNZ0lSSkQwd1BWMmQzRVJkZjRUVkEwcGxPbl9HZlRPSGlKZVZwcmtjcTJibnJ0T3VvWTRKd1RHcFl4YVNfd3htWkEtUlpPTzFibURlZXhiWnE4a290ZFpsamViZDRJOXFmWU1DMnd1Mk5KY1ZOR040WFVOVnctNFY1NllYTjdESEdyZFVnc0tBVFFqN0RsMmgybjhPZGVzNE1VWlRDa3RpdmRoUW1HYVRZUzhOczhjNUh6TldOWFZVTGFrWFpzNVVOOUxOeTU5a0xGZkQ5YThyZ1l2SUNKbERQX0cwWjBudlVLRE5sNjF5S0hnWWVid3BkUmZuR0ZyMTRZNjJLLUNMMTZJUXdxYXRwQmVjX0FocUpjVTh5c3luVFB1cEtXV2J2SlZFdWI1OXhaRDNjNWEzcW1QXzJjREN3OUlVLTMwTkhXek5XcWtlbml2b25rdyIKfQ==",
      lastTime: {
        message: "You: i don't remember 😄 ",
        time: "18:30"
      },
      badge: null,
      active: true
    },
    {
      username: "Alice",
      avatar: "https://i.imgur.com/XfCyTdg.jpeg",
      publicKey: null,
      lastTime: {
        message: "Ok, see you later",
        time: "18:30"
      },
      badge: { status: "unread", data: 3 },
      active: false
    },
    {
      username: "Chris",
      avatar: "https://i.imgur.com/qnT4TJZ.png",
      publicKey: null,
      lastTime: {
        message: "I got a job at SpaceX 🎉 🚀  ",
        time: "19:08"
      },
      badge: { status: "read", data: 5 },
      active: false
    },
    {
      username: "John",
      avatar: "https://i.imgur.com/M0xD1by.png",
      publicKey: null,
      lastTime: {
        message: "Table for four, 5PM. Be there.",
        time: "19:56"
      },
      badge: { status: "miss-call" },
      active: false
    }
  ]));
}
</script>

<style lang="scss">
@import '../assets/style/style.scss';
@import 'vue-toast-notification/dist/theme-sugar.css';
</style>

<style scoped lang="scss">
@import '../assets/style/layouts/default.scss';
</style>
