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

    <form @:submit.prevent="sendMessage">
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
import { useToast } from 'vue-toast-notification';
import { cryptoApi } from "~/api/utils";

const store = useMainStore();
const $toast = useToast();
const message = ref();

onMounted(() => {
  store.ws = new WS();

  store.ws.ws.onmessage = async (msg) => {
    const packed = await msg.data.arrayBuffer();
    const res = unpack(packed)
    console.log(res)

    if (res.action === "init") {
      if (res.success) {
        localStorage.setItem("token", res.token)

        $toast.clear();

        $toast.open({
          message: "You're connected!",
          type: "success",
          position: "top-right",
          duration: 10000
        });

        return;
      }

      $toast.clear();
      //localStorage.clear();

      $toast.open({
        message: 'Username already taken, please refresh page.',
        type: "error",
        position: "top-right",
        duration: 0
      });

      return store.ws.ws.close()
    }

    if (res.action === "askFriendResult") {
      if (!res.success) {
        $toast.clear();

        return $toast.open({
          message: "The user doesn't exist.",
          type: "error",
          position: "top-right"
        });
      }

      addSomeoneToContact(res)

      $toast.open({
        message: `${res.who} has accepted your friend request`,
        type: "success",
        position: "top-right",
        duration: 5000
      });
    }

    if (res.action === "askFriendRequest") {
      $toast.open({
        message: `${res.who} asks you as friends`,
        type: "info",
        position: "top-right",
        duration: 15000,
        onClick: () => {
          store.ws.acceptFriend(res.who)
        }
      });
    }

    if (res.action === "message") {
      const privateKey = await cryptoApi.importKey(localStorage.getItem("private"), "private")
      const decryptedMessage = await cryptoApi.decrypt(res.message, privateKey)

      addMessage(decryptedMessage, false);
    }
  }
})

async function sendMessage() {
  const msg = message.value;

  if (!msg || (/^\s+$/g).test(msg)) {
    $toast.clear();
    return $toast.open({
      message: 'Please enter a non-empty message.',
      type: "error",
      position: "top-right"
    });
  }

  const publicKey = await cryptoApi.importKey(store.currentContact.publicKey, "public")
  const encryptedMessage = await cryptoApi.encrypt(msg, publicKey)

  store.ws.sendMessageData(encryptedMessage, store.currentContact.username)

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

function addSomeoneToContact(res) {
  const previousContacts = JSON.parse(localStorage.getItem("contacts"));
  const userAlreadyInContacts = previousContacts.find(contact => {
    return contact.username === res.who;
  })

  if (userAlreadyInContacts) return;

  console.log({
    username: res.who,
    publicKey: res.publicKey,
    avatar: null
  })

  localStorage.setItem("contacts", JSON.stringify([
    ...previousContacts,
    {
      username: res.who,
      publicKey: res.publicKey,
      avatar: null
    }
  ]))
}
</script>

<style lang="scss">
@import '../assets/style/pages/index.scss';
</style>
