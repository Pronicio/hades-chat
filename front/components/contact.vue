<template>
  <aside>
    <div class="header">
      <div class="menu-icon"></div>
      <div class="search">
        <div class="search-icon"></div>
        <input type="text" placeholder="Search..." v-model="search">
      </div>
    </div>
    <div class="contacts">
      <div :class="`contact ${contact.active ? 'active' : ''}`" v-for="contact in contacts" :key="contact.username"
           :id="contact.username" @click="changeContact(contact.username)">
        <img :src="contact.avatar || 'https://i.imgur.com/FkZ8zcY.gif'" :alt="`${contact.username}'s avatar.`"
             width="75">
        <div class="infos">
          <h4>{{ contact.username }}</h4>
          <p>{{ contact.lastTime?.message }}</p>
        </div>
        <div class="dates">
          <p>{{ contact.lastTime?.time }}</p>
          <div class="badge" :id="contact.badge?.status">{{ contact.badge?.data }}</div>
        </div>
      </div>
    </div>
    <div class="addContact" @click="modalState = true">
      <img src="../assets/icons/add.svg" alt="AddContact's image">
      <div class="infos">
        <h4>Add a contact</h4>
      </div>
    </div>
  </aside>
  <modal v-if="modalState" title="Enter the name of the user:" @close="modalState = false" @submit="askFriend"></modal>
</template>

<script setup lang="ts">
import { stringSimilarity } from "string-similarity-js";
import { ContactList } from "~/api/types";
import { useMainStore } from "~/store";

const store = useMainStore();
const search = ref()
const modalState = ref(false)

const contacts = ref(<ContactList>[])

onMounted(() => {
  contacts.value = JSON.parse(localStorage.getItem("contacts")) as ContactList
  store.currentContact = contacts.value[0];
})

watch(search, () => {
  contacts.value.sort((a, b) => {
    const compareA = stringSimilarity(a.username.toLowerCase(), search.value)
    const compareB = stringSimilarity(b.username.toLowerCase(), search.value)
    return (Math.abs(1 - compareA) - Math.abs(1 - compareB));
  });
})

function changeContact(newContact) {
  const contact = contacts.value.find(el => el.username === newContact)
  const contactBefore = contacts.value.find(el => el.active)

  if (contact && contactBefore) {
    contact.active = true;
    contactBefore.active = false;

    store.currentContact = contact;
  }
}

function askFriend(username) {
  store.ws.askFriend(username)
}
</script>

<style scoped lang="scss">
@import '../assets/style/components/contact.scss';
</style>
