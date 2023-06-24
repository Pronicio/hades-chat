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
           :id="contact.username" @click="changeContact(contact)">
        <img :src="contact.avatar || 'https://i.imgur.com/FkZ8zcY.gif'" :alt="`${contact.username}'s avatar.`"
             width="75">
        <div class="infos">
          <h4>{{ contact.username }}</h4>
          <p>{{ contact.lastTime?.message }}</p>
        </div>
        <div class="dates">
          <p>{{ getDate(contact.lastTime?.time) }}</p>
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
import { getDate } from "~/api/utils";

const store = useMainStore();
const { $emit, $listen } = useNuxtApp()
const search = ref()
const modalState = ref(false)

const contacts = ref(<ContactList>[])

onMounted(() => {
  contacts.value = JSON.parse(localStorage.getItem("contacts")) as ContactList
  store.currentContact = contacts.value.find(el => el.active)
})

watch(search, () => {
  contacts.value.sort((a, b) => {
    const compareA = stringSimilarity(a.username.toLowerCase(), search.value)
    const compareB = stringSimilarity(b.username.toLowerCase(), search.value)
    return (Math.abs(1 - compareA) - Math.abs(1 - compareB));
  });
})

$listen('contact:new', (user) => {
  contacts.value.push(user)
  changeContact(user)
})

$listen('contact:edit', async (user) => {
  const contact = contacts.value.find(el => el.username === user.username)

  if (contact) {
    const index = contacts.value.indexOf(contact)

    if (contact.badge?.data && user.badge?.data) {
      user.badge.data = contact.badge?.data + 1
    }

    contacts.value[index] = { ...contact, ...user };

    $emit("contact:move", contact)
    await nextTick(); localStorage.setItem("contacts", JSON.stringify(contacts.value))
  }
})

$listen('contact:move', (contact) => {
  contacts.value.sort(function (x, y) {
    return x.username === contact.username ? -1 : y.username === contact.username ? 1 : 0;
  });
})

function changeContact(newContact) {
  const contact = contacts.value.find(el => el.username === newContact.username)
  const contactBefore = contacts.value.find(el => el.active)

  if (contact && contactBefore) {
    if (contact.username === contactBefore.username) {
      if (document.documentElement.clientWidth <= 800) {
        return $emit("mobile:user:toggle", contact)
      }
      return;
    }

    contact.active = true;
    contactBefore.active = false;

    if (contact.badge) {
      const index = contacts.value.indexOf(contact)
      contact.badge.status = null
      contact.badge.data = undefined
      contacts.value[index] = contact
      localStorage.setItem("contacts", JSON.stringify(contacts.value))
    }

    store.currentContact = contact;
    $emit("user:change", true)
  }
}

function askFriend(username) {
  store.ws.askFriend(username)
}
</script>

<style scoped lang="scss">
@import '../assets/style/components/contact.scss';
</style>
