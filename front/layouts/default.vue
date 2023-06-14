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
    localStorage.setItem("username", username)
    await genKey()
    created.value = true;
    (document.getElementById("main") as HTMLElement).style.display = "block"
  }
}

async function genKey() {
  const keys = await cryptoApi.createKeys()
  localStorage.setItem("private", keys.privateKey)
  localStorage.setItem("public", keys.publicKey)

  const pKey = await cryptoApi.importKey(localStorage.getItem("private"), "private")
  console.log(pKey);
}
</script>

<style lang="scss">
@import '../assets/style/style.scss';
</style>

<style scoped lang="scss">
@import '../assets/style/layouts/default.scss';
</style>
