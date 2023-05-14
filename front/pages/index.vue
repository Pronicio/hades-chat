<template>
    <section id="app">
        <div class="discussion">
            <div class="chat">
                <p>Hello guysssssssssssssssssssss !</p>
            </div>
            <div class="chat me">
                <p>Hi !!</p>
            </div>
            <div class="chat">
                <p>How are you ?</p>
            </div>
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
import { unpack } from "msgpackr";

const store = useMainStore();
const message = ref();

onMounted(() => {
    store.ws = new WS();

    store.ws.ws.onmessage = async (msg) => {
        const packed = await msg.data.arrayBuffer();
        const res = unpack(packed)

        if (res.action === "message") {
            addMessage(res.data.message, false);
        }
    }
})

function sendMessage() {
    const msg = message.value;
    store.ws.sendData(msg, "global")

    addMessage(msg, true)
    scrollToBottom(true);

    message.value = null;
}

function addMessage(text: string, me: boolean) {
    const parent = document.querySelector(".discussion")
    const newChild = document.createElement("div")

    parent.appendChild(newChild).classList.add("chat")
    if (me) newChild.classList.add("me")

    newChild.appendChild(document.createElement("p")).innerText = text
    scrollToBottom();
}

function scrollToBottom(force = false) {
    const out = document.getElementsByClassName('discussion')[0]
    const isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 200

    if (force || isScrolledToBottom) {
        out.scrollTop = out.scrollHeight - out.clientHeight;
    }
}
</script>

<style lang="scss">
@import '../assets/style/pages/index.scss';
</style>
