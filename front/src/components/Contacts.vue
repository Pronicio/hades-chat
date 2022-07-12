<template>
  <component :is="addUserModal" @addUser="addUser"></component>
  <section>
    <div class="search_bar">
      <div id="burger"></div>
      <form v-on:submit.prevent="search" id="search">
        <div class="search_icon" @click="search"></div>
        <input type="search" id="site-search" placeholder="Search..." v-model="searchInput">
      </form>
      <div>
      </div>
    </div>
    <div class="contacts">
      <div :class="`user ${user.id === 'global' ? 'selected': ''}`" v-for="user in contacts" :key="user.id" :id="user.id" @click="changePersons(user.id)">
        <img :src="user.picture" :alt="`${user.username} Picture`" width="48"/>
        <div class="infos">
          <h3>{{ user.username }}</h3>
          <p>{{ user.last.msg }}</p>
        </div>
      </div>
      <div class="user" @click="addUserActiveModal">
        <img src="../assets/images/icons/add.svg" alt="Add someone" width="48"/>
        <h3>Add someone</h3>
      </div>
    </div>
  </section>
</template>

<script>
import stringSimilarity from "string-similarity";
import AddUser from "./AddUser.vue";

export default {
  name: "Contacts",
  components: { AddUser },
  data: function () {
    return {
      searchInput: null,
      current: 'global',
      contacts: [
        {
          username: "Global Chat", id: "global", picture: "https://i.imgur.com/BcKjFGH.png", last: {
            msg: "Hello Everyone !", time: "Just now"
          }
        },
        {
          username: "Hadès Bot", id: "chatbot", picture: "https://i.imgur.com/nPCPfmM.png", last: {
            msg: "...", time: "Just now"
          }
        },
        {
          username: "Jessica Drew", id: "123", picture: "https://i.imgur.com/kPrwrVR.jpg", last: {
            msg: "Ok, see you later", time: "Just now"
          }
        },
        {
          username: "David Moore", id: "456", picture: "https://i.imgur.com/SrNqmCr.jpg", last: {
            msg: "You: i don't remember anything 😄", time: "18:30"
          }
        },
        {
          username: "Greg James", id: "879", picture: "https://i.imgur.com/CMow1x0.jpg", last: {
            msg: "I got a job at SpaceX 🎉 🚀 ", time: "18:16"
          }
        },
        {
          username: "Emily Dorson", id: "321", picture: "https://i.imgur.com/LuurvEM.jpg", last: {
            msg: "Table for four, 5PM. Be there.", time: "18:02"
          }
        },
        {
          username: "Little Sister", id: "654", picture: "https://i.imgur.com/Q7Rxmwy.jpg", last: {
            msg: "Tell mom i will be home for tea 💜 ", time: "16:42"
          }
        },
        {
          username: "Art Class", id: "987", picture: "https://i.imgur.com/q1ssPTY.png", last: {
            msg: "Your projects are due at 8pm sharp! Otherwise you'll have to deal with me!", time: "Yesterday"
          }
        }
      ],
      addUserModal: null
    }
  },
  methods: {
    search: function () {
      this.contacts.sort((a, b) => {
        let compareA = stringSimilarity.compareTwoStrings(a.username.toLowerCase(), this.searchInput.toLowerCase())
        let compareB = stringSimilarity.compareTwoStrings(b.username.toLowerCase(), this.searchInput.toLowerCase())
        return (Math.abs(1-compareA) - Math.abs(1-compareB));
      });
    },
    changePersons: function (id) {
      const now = document.getElementById(id);
      now.classList.toggle("selected");

      const forward = document.getElementById(this.current);
      forward.classList.toggle("selected");

      const details = this.contacts.find(el => el.id === id);

      this.$emit('changePersons', id, details)
      this.current = id
    },
    addUserActiveModal: function () {
      this.addUserModal = "AddUser"
    },
    addUser: function (id) {
      console.log(id)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/style/components/contacts.scss';
</style>

