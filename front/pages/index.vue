<template>
    <section id="app">
        <div class="chat">
            <p>Hello guysssssssssssssssssssss !</p>
        </div>
        <div class="chat me">
            <p>Hi !!</p>
        </div>
        <div class="chat">
            <p>How are you ?</p>
        </div>

        <form @:submit.prevent="sendMessage" class="input">
            <input type="text" id="text" name="text" required size="10" placeholder="Say something..."
                   v-model="message">
            <div class="send-icon" @click="sendMessage"></div>
        </form>
    </section>
</template>

<script setup lang="ts">
import { WS } from "~/api/websocket";
import { useMainStore } from "~/store";

const store = useMainStore();
const message = ref();

onMounted(() => {
    store.ws = new WS();
})

function sendMessage() {
    const msg = message.value;
    store.ws.sendData(msg, "global")

    message.value = null;
}
</script>

<style scoped lang="scss">
@import '../assets/style/pages/index.scss';
</style>
