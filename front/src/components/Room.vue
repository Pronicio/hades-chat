<template>
  <section id="room">
    <Headbar :details="details" :last="last"/>
    <div class="page">
      <div class="messages">
        <div v-if="who === 'global'" class="msg info"><p>Say hi to the world !</p></div>
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
      users: [],
      last: null
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
        publicKey: window.btoa(encodeURIComponent(this.publicKey)),
        notification: null
      }));
    });

    this.ws.addEventListener('message', async (event) => {
      const data = JSON.parse(event.data);
      const storage = localStorage.getItem('save_session') ? localStorage : sessionStorage;

      switch (data.action) {
        case "newId":
          this.id = data.id;
          this.token = data.token;
          storage.setItem('id', data.id);
          storage.setItem('token', data.token);
          break;
        case "newName":
          this.username = data.name;
          storage.setItem('name', data.name);
          break;
        case "from":
          let message = data.msg;

          if (data.from === "chatbot") {
            this.messages.push(message);
            this.changeDetails(message)
            break;
          }

          if (data.from !== "global") {
            const privateKey = await api.importKey(this.privateKey, "private")
            message = await api.decrypt(data.msg, privateKey)
          }

          if (this.who === data.from) {
            this.messages.push(message);
          } else {
            const storage = localStorage.getItem('save_session') ? localStorage : sessionStorage;
            const stocked = storage.getItem(data.from)

            if (!stocked) {
              storage.setItem(data.from, [ { ...message } ])
            } else {
              const userMessages = JSON.parse(stocked)
              userMessages.push(message);
              storage.setItem(data.from, JSON.stringify(userMessages))

              if (this.checkNotificationPromise()) {
                if (this.notification) this.notification.close()

                const contacts = JSON.parse(storage.getItem("contacts"))
                const user = contacts.find(el => el.id === data.from)

                this.notification = new Notification(user.username, { body: message, icon: user.picture });
              }
            }
          }
          this.changeDetails(message)
          break;
        default:
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

      let message;
      if (this.userPublicKey) {
        message = await api.encrypt(this.msg, this.userPublicKey)
      } else {
        message = this.msg
      }

      await this.ws.send(JSON.stringify({
        action: "msg",
        to: this.who,
        username: this.username,
        id: this.id,
        token: this.token,
        msg: message
      }));

      this.scrollToBottom(true)
      this.msg = null;
      this.saveMessages(this.who)
    },
    scrollToBottom: function (force = false, newMsg = false) {
      const out = document.getElementsByClassName('messages')[0]
      const isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 200

      if (force || !isScrolledToBottom || (newMsg && isScrolledToBottom)) {
        out.scrollTop = out.scrollHeight - out.clientHeight;
      }
    },
    saveMessages: function (id) {
      const storage = localStorage.getItem('save_session') ? localStorage : sessionStorage
      storage.setItem(id, JSON.stringify(this.messages))
    },
    checkNotificationPromise: function () {
      try {
        Notification.requestPermission().then();
      } catch (e) {
        return false;
      }
      return true;
    },
    changeDetails: function (message) {
      this.last = {
        id: this.details.id,
        time: Date.now(),
        msg: message
      }

      console.log(this.last)
      this.$emit('updateLast', this.last)

      const storage = localStorage.getItem('save_session') ? localStorage : sessionStorage
      const contacts = JSON.parse(storage.getItem("contacts"))

      const index = contacts.findIndex(el => el.id === this.details.id);

      if (index !== -1) {
        contacts[index] = {
          ...this.details, last: {
            time: Date.now(),
            msg: message
          }
        };
      }

      storage.setItem("contacts", JSON.stringify(contacts))
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

      if (!user.publicKey) return this.userPublicKey = null;
      api.importKey(decodeURIComponent(window.atob(user.publicKey)), "public").then(publicKey => {
        this.userPublicKey = publicKey
      })
    },
    messages: {
      async handler() {
        await this.$nextTick()
        this.scrollToBottom(false, true)
      },
      deep: true
    }
  },
}
</script>

<style scoped lang="scss">
@import '../assets/style/components/room.scss';
</style>
