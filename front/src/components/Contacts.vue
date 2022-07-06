<template>
  <section>
    <div class="search_bar">
      <div id="burger"></div>
      <div id="search">
        <div class="search_icon"></div>
        <input type="search" id="site-search" placeholder="Search...">
      </div>
    </div>
    <div class="contacts">
      <div class="user" v-for="user in contacts" :key="user.id" :id="user.id">
        <img :src="user.picture" :alt="`${user.username} Picture`" width="48"/>
        <div class="infos">
          <h3>{{ user.username }}</h3>
          <p>{{ user.last.msg }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "Contacts",
  data: function () {
    return {
      current: null,
      contacts: [
        { username: "Global Chat", id: "global", picture: "https://i.imgur.com/BcKjFGH.png", last: {
            msg: "Hello Everyone !", time: "Just now"
        }},
        { username: "Jessica Drew", id: "123", picture: "https://i.imgur.com/kPrwrVR.jpg", last: {
          msg: "Ok, see you later", time: "Just now"
        }},
        { username: "David Moore", id: "123", picture: "https://i.imgur.com/SrNqmCr.jpg", last: {
            msg: "You: i don't remember anything 😄", time: "18:30"
        }},
        { username: "Greg James", id: "123", picture: "https://i.imgur.com/CMow1x0.jpg", last: {
            msg: "I got a job at SpaceX 🎉 🚀 ", time: "18:16"
        }},
        { username: "Emily Dorson", id: "123", picture: "https://i.imgur.com/LuurvEM.jpg", last: {
            msg: "Table for four, 5PM. Be there.", time: "18:02"
        }},
        { username: "Little Sister", id: "123", picture: "https://i.imgur.com/Q7Rxmwy.jpg", last: {
            msg: "Tell mom i will be home for tea 💜 ", time: "16:42"
        }},
        { username: "Art Class", id: "123", picture: "https://i.imgur.com/q1ssPTY.png", last: {
            msg: "Your projects are due at 8pm sharp! Otherwise you'll have to deal with me!", time: "Yesterday"
        }}
      ]
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/style/components/contacts.scss';
</style>

