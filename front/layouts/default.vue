<template>
    <div v-if="mounted">
        <main v-if="created">
            <contact></contact>
            <slot></slot>
        </main>
        <section v-else>
            <h1>TODO: FORM FOR REGISTER</h1>
        </section>
    </div>
</template>

<script setup lang="ts">
import { cryptoApi } from "~/api/utils";

const created = ref(false)
const mounted = ref(false)

onBeforeMount(() => {
    const userExist = localStorage.getItem("username")
    const userTokenExist = localStorage.getItem("token")

    if (userExist && userTokenExist) {
        created.value = true
    }

    mounted.value = true
})

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
