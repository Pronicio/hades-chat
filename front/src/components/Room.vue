<template>
  <section>
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

    <!--
    <div>
      <h3>Users connected :</h3>
      <div class="users">
        <div class="user" v-for="user in users" :key="user">
          <p>{{ user }}</p>
        </div>
      </div>
    </div>
    -->
  </section>
</template>

<script>

import { AES, enc } from 'crypto-js';

export default {
  name: "Room",
  props: [ 'who' ],
  data: function () {
    return {
      username: `Unknown-${Math.floor(Math.random() * 100)}`,
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
        username: this.username
      }));
    });

    this.ws.addEventListener('message', (event) => {
      if (event.data.includes("newUser") || event.data.includes("leaveUser")) {
        const data = JSON.parse(event.data);
        this.messages.push(data);
      } else {
        this.messages.push(event.data);
      }
    });

    const encrypted = AES.encrypt("Message", "Secret Passphrase");
    const decrypted = AES.decrypt(encrypted, "Secret Passphrase");

    console.log(decrypted.toString(enc.Utf8))

  },
  methods: {
    sendMessage: async function () {
      this.messages.push({ action: 'me', msg: this.msg });
      await this.ws.send(JSON.stringify({
        action: "msg",
        username: this.username,
        msg: this.msg
      }));

      this.scrollToBottom(true)
      this.msg = null;
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
    }
  },
  watch: {
    who(id) {
      console.log("Id", id)
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
