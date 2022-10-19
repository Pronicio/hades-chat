<template>
  <section>
    <Headbar :details="details"/>
    <div class="page">
      <div class="messages">
        <div :class="`msg ${typeof msg === 'object' ? msg.action : ''}`" v-for="msg in messages" :key="msg">
          <p v-if="typeof msg === 'object'">{{ msg.msg }}</p>
          <p v-else>{{ msg }}</p>
        </div>
      </div>

      <form v-on:submit.prevent="sendMessage">
        <input v-model="msg" type="text" id="message" required size="10" placeholder="Message" minlength="1"
               maxlength="110">
        <div class="send" @click="sendMessage"></div>
      </form>
    </div>
  </section>
</template>

<script>
import Headbar from "./Headbar.vue";
import { api } from "../api.js"

export default {
  name: "Room",
  components: { Headbar },
  props: [ 'who', 'details' ],
  data: function () {
    return {
      username: localStorage.getItem('name') || sessionStorage.getItem('name'),
      id: localStorage.getItem('id') || sessionStorage.getItem('id'),
      token: localStorage.getItem('token') || sessionStorage.getItem('token'),
      picture: localStorage.getItem('picture') || sessionStorage.getItem('picture'),
      publicKey: localStorage.getItem('publicKey') || sessionStorage.getItem('publicKey'),
      privateKey: localStorage.getItem('privateKey') || sessionStorage.getItem('privateKey'),
      userPublicKey: null,
      msg: null,
      messages: [],
      users: []
    }
  },
  mounted: function () {
    const ws = new WebSocket(import.meta.env.VITE_WS_URI);
    this.ws = ws;

    this.ws.addEventListener('open', () => {
      ws.send(JSON.stringify({
        action: "new",
        username: this.username,
        id: this.id,
        token: this.token,
        picture: this.picture,
        publicKey: window.btoa(encodeURIComponent(this.publicKey))
      }));
    });

    this.ws.addEventListener('message', async (event) => {
      //TODO: Clean this thing :
      if (event.data.includes("newUser") || event.data.includes("leaveUser")) {
        if (this.who !== "global") {
          const storage = localStorage.getItem('save_session') ? localStorage : sessionStorage
          const globalMessages = JSON.parse(storage.getItem("global"))

          const data = JSON.parse(event.data);
          globalMessages.push(data);
          storage.setItem("global", JSON.stringify(globalMessages))
          //TODO: Notification + update last.msg / last.time
        } else {
          const data = JSON.parse(event.data);
          this.messages.push(data);
        }
      } else if (event.data.includes("newId")) {
        const storage = localStorage.getItem('save_session') ? localStorage : sessionStorage
        const data = JSON.parse(event.data);
        this.id = data.id;
        this.token = data.token;
        storage.setItem('id', data.id);
        storage.setItem('token', data.token);
      } else if (event.data.includes("newName")) {
        const storage = localStorage.getItem('save_session') ? localStorage : sessionStorage
        const data = JSON.parse(event.data);
        this.username = data.name;
        storage.setItem('name', data.name);
      } else if (event.data.includes("from")) {
        const data = JSON.parse(event.data);
        const privateKey = await api.importKey(this.privateKey, "private")
        const message = await api.decrypt(data.msg, privateKey)

        if (this.who === data.from) {
          this.messages.push(message);
        } else {
          const storage = localStorage.getItem('save_session') ? localStorage : sessionStorage
          const userMessages = JSON.parse(storage.getItem(data.from))

          if (userMessages) {
            userMessages.push(message);
            storage.setItem(data.from, JSON.stringify(userMessages))
            //TODO: Notification + update last.msg / last.time
          } else {
            storage.setItem(data.from, [ { ...message } ])
          }
        }
      } else {
        this.messages.push(event.data);
      }
      this.saveMessages(this.who)
    });

    const storage = localStorage.getItem('save_session') ? localStorage : sessionStorage
    const msgInCache = storage.getItem(this.who)
    if (msgInCache) this.messages = JSON.parse(msgInCache)
  },
  methods: {
    sendMessage: async function () {
      this.messages.push({ action: 'me', msg: this.msg });
      await this.ws.send(JSON.stringify({
        action: "msg",
        to: this.who,
        username: this.username,
        id: this.id,
        token: this.token,
        msg: await api.encrypt(this.msg, this.userPublicKey)
      }));

      this.scrollToBottom(true)
      this.msg = null;
      this.saveMessages(this.who)
    },
    scrollToBottom: function (force = false) {
      const out = document.getElementsByClassName('messages')[0]
      const isScrolledToBottom = out.scrollHeight - out.clientHeight <= (out.scrollTop + 200) + 1

      if (force || !isScrolledToBottom) {
        out.scrollTop = out.scrollHeight - out.clientHeight;
      }
    },
    saveMessages: function (id) {
      const storage = localStorage.getItem('save_session') ? localStorage : sessionStorage
      storage.setItem(id, JSON.stringify(this.messages))
    }
  },
  watch: {
    who(id, previousUser) {
      const storage = localStorage.getItem('save_session') ? localStorage : sessionStorage
      this.saveMessages(previousUser)

      const data = storage.getItem(id)
      if (!data) return this.messages = [];

      this.messages = JSON.parse(data)
      this.scrollToBottom(true)

      // TODO: Copy :
      const contacts = JSON.parse(storage.getItem("contacts"))
      const user = contacts.find(el => el.id === id)

      if (!user.publicKey) return
      api.importKey(decodeURIComponent(window.atob(user.publicKey)), "public").then(publicKey => {
        this.userPublicKey = publicKey
      })
    },
    messages: {
      async handler() {
        await this.$nextTick()
        this.scrollToBottom()
      },
      deep: true
    }
  },
}
</script>

<style scoped lang="scss">
@import '../assets/style/components/room.scss';
</style>
