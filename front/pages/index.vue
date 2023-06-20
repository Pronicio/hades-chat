<template>
  <section id="app">
    <div class="discussion">
      <div :class="`chat ${msg.username === 'me' ? 'me' : ''}`" v-for="msg in messages" :key="msg.content">
        <p>{{ msg.content }}</p>
      </div>
    </div>

    <form @:submit.prevent="sendMessage">
      <input type="text" id="text" name="text" required size="10" placeholder="Say something..."
             v-model="input">
      <div class="send-icon" @click="sendMessage"></div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { WS } from "~/api/websocket";
import { useMainStore } from "~/store";
import { cryptoApi } from "~/api/utils";
import { unpack } from "msgpackr";
import { useToast } from 'vue-toast-notification';
import { Message, MessageList } from "~/api/types";

const store = useMainStore();
const $toast = useToast();
const { $emit, $listen } = useNuxtApp()

const input = ref();
const messages = ref([] as MessageList)

onMounted(async () => {
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

    if (res.action === "askFriendResultForReceiver") {
      addSomeoneToContact(res)
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

      if (res.who === store.currentContact.username) {
        await addMessage(decryptedMessage, res.who)
      } else {
        const savedChat = localStorage.getItem(res.who)

        if (!savedChat) {
          return localStorage.setItem(res.who, JSON.stringify([]))
        }

        const timeNow = Date.now()

        $emit('contact:edit', {
          username: res.who,
          lastTime: {
            message: decryptedMessage,
            time: timeNow
          },
          badge: {
            status: "unread",
            data: 1
          }
        })

        const blend = JSON.parse(savedChat)
        blend.push({
          username: res.who,
          content: decryptedMessage,
          date: timeNow
        })

        localStorage.setItem(res.who, JSON.stringify(blend))
      }
    }
  }

  await changeChat(store.currentContact.username)
})

$listen("user:change", async (user) => {
  await changeChat(user.username)
})

async function sendMessage() {
  const msg = input.value;

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

  await addMessage(msg, "me")
  scrollToBottom(true);

  input.value = null;
}

async function addMessage(msg: string, username: string) {
  const timeNow = Date.now()

  const data = {
    username: username,
    content: msg,
    date: timeNow
  } as Message

  messages.value.push(data)

  if (username !== "me") {
    $emit('contact:edit', {
      username: username,
      lastTime: {
        message: msg,
        time: timeNow
      }
    })
  }

  localStorage.setItem(username, JSON.stringify(messages.value))

  await nextTick(); scrollToBottom();
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

  const newUser = ({
    username: res.who,
    publicKey: res.publicKey,
    avatar: null
  })

  localStorage.setItem("contacts", JSON.stringify([
    ...previousContacts,
    newUser
  ]))

  $emit('contact:new', newUser)
}

async function changeChat(username) {
  const savedChat = localStorage.getItem(username)

  if (!savedChat) {
    localStorage.setItem(username, JSON.stringify([]))
    return messages.value = [] as MessageList
  }

  messages.value = JSON.parse(savedChat)
  await nextTick(); scrollToBottom(true);
}
</script>

<style lang="scss">
@import '../assets/style/pages/index.scss';
</style>
