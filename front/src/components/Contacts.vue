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
      <div :class="`user ${user.id === 'global' ? 'selected': ''}`" v-for="user in contacts" :key="user.id"
           :id="user.id" @click="changePersons(user.id)">
        <img :src="user.picture" :alt="`${user.username} Picture`" width="48"/>
        <div class="infos">
          <h3>{{ user.username }}</h3>
          <p>{{ user.last?.msg }}</p>
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
      contacts: JSON.parse(localStorage.getItem('contacts') || sessionStorage.getItem('contacts')),
      addUserModal: null
    }
  },
  methods: {
    search: function () {
      this.contacts.sort((a, b) => {
        let compareA = stringSimilarity.compareTwoStrings(a.username.toLowerCase(), this.searchInput.toLowerCase())
        let compareB = stringSimilarity.compareTwoStrings(b.username.toLowerCase(), this.searchInput.toLowerCase())
        return (Math.abs(1 - compareA) - Math.abs(1 - compareB));
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
    addUser: async function (name) {
      this.addUserModal = null

      const response = await fetch(`${import.meta.env.VITE_API_URI}/get_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
          username: name
        })
      });
      const data = await response.json();

      if (data.success) {
        const userInfos = {
          username: name,
          id: data.id,
          picture: data.picture,
          publicKey: data.publicKey
        }

        this.contacts.push(userInfos)

        const storage = localStorage.getItem('save_session') ? localStorage : sessionStorage;
        const contacts = JSON.parse(storage.getItem("contacts"))
        contacts.push(userInfos)

        storage.setItem("contacts", JSON.stringify(contacts))
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/style/components/contacts.scss';
</style>

