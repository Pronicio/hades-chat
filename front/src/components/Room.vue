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
        <input v-model="msg" type="text" id="message" required size="10" placeholder="Message" @keydown="autoHeight">
        <div class="send"></div>
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
      id: localStorage.getItem('id'),
      msg: null,
      messages: [],
      users: []
    }
  },
  mounted: function () {
    const ws = new WebSocket('ws://127.0.0.1:9000');
    this.ws = ws;

    this.ws.addEventListener('open', () => {
      ws.send(JSON.stringify({
        action: "new",
        username: this.username,
        id: this.id,
      }));
    });

    this.ws.addEventListener('message', (event) => {
      if (event.data.includes("newUser") || event.data.includes("leaveUser")) {
        const data = JSON.parse(event.data);
        this.messages.push(data);
      } else if (event.data.includes("newId")) {
        const data = JSON.parse(event.data);
        localStorage.setItem('id', data.id)
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
        msg: this.msg
      }));

      this.scrollToBottom(true)
      this.msg = null;
      this.saveMessages(this.who)
    },
    autoHeight: function () {
      const el = document.getElementById('message')
      el.style.cssText = 'height:' + el.scrollHeight + 'px';
    },
    scrollToBottom: function (pass = false) {
      const out = document.getElementsByClassName('messages')[0]
      const isScrolledToBottom = out.scrollHeight - out.clientHeight <= (out.scrollTop + 200) + 1

      if (pass || isScrolledToBottom) {
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
