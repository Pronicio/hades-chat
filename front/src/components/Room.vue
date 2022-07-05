<template>
  <h2>Room :</h2>
  <div class="messages">
    <div class="msg" v-for="msg in messages" :key="msg">
      <p>{{ msg }}</p>
    </div>
  </div>

  <form v-on:submit.prevent="sendMessage">
    <label for="message">Send Message : </label>
    <input v-model="msg" type="text" id="message" required maxlength="1000" size="10">
  </form>

  <div>
    <h3>Users connected :</h3>
    <div class="users">
      <div class="user" v-for="user in users" :key="user">
        <p>{{ user }}</p>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "Room",
  data: function () {
    return {
      username: `Unknown-${Math.floor(Math.random() * 100)}`,
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
      if (event.data.includes("usersConnected")) {
        const data = JSON.parse(event.data)
        this.users = data.usersConnected
      }
      else if (event.data.includes("newUser")) {
        const data = JSON.parse(event.data)
        this.users.push(data.username)
      }
      else if (event.data.includes("leaveUser")) {
        const data = JSON.parse(event.data)
        this.users.splice(this.users.indexOf(data.username), 1)
      }
      else {
        this.messages.push(event.data);
      }
    });
  },
  methods: {
    sendMessage: async function () {
      this.ws.send(JSON.stringify({
        action: "msg",
        username: this.username,
        msg: this.msg
      }));

      this.msg = null;
    }
  }
}
</script>
