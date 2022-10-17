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

export default {
  name: "Room",
  components: { Headbar },
  props: [ 'who', 'details' ],
  data: function () {
    return {
      username: localStorage.getItem('name') || sessionStorage.getItem('name'),
      id: localStorage.getItem('id') || sessionStorage.getItem('id'),
      token: localStorage.getItem('token') || sessionStorage.getItem('token'),
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
        token: this.token
      }));
    });

    this.ws.addEventListener('message', (event) => {
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

        if (this.who === data.from) {
          this.messages.push(data.msg);
        } else {
          const storage = localStorage.getItem('save_session') ? localStorage : sessionStorage
          const userMessages = JSON.parse(storage.getItem(data.from))

          if (userMessages) {
            userMessages.push(data.msg);
            storage.setItem(data.from, JSON.stringify(userMessages))
            //TODO: Notification + update last.msg / last.time
          } else {
            storage.setItem(data.from, [ { ...data.msg } ])
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
        msg: this.msg
      }));

      this.scrollToBottom(true)
      this.msg = null;
      this.saveMessages(this.who)
    },
    scrollToBottom: function (pass = false) {
      const out = document.getElementsByClassName('messages')[0]
      const isScrolledToBottom = out.scrollHeight - out.clientHeight <= (out.scrollTop + 200) + 1

      if (pass || !isScrolledToBottom) {
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
