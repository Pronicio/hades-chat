<template>
  <Contacts @changePersons="changePersons" :last="last"/>
  <Room :who="who" :details="details" @updateLast="updateLast"/>
</template>

<script>
import Room from '../components/Room.vue'
import Contacts from '../components/Contacts.vue'

export default {
  name: "Home",
  components: {
    Room, Contacts
  },
  data: function () {
    return {
      who: 'global',
      details: {
        username: "Global Chat", id: "global", picture: "https://i.imgur.com/BcKjFGH.png", last: {
          msg: "Hello Everyone !", time: "Just now"
        }
      },
      last: null
    }
  },
  mounted() {
    Notification.requestPermission()
  },
  methods: {
    changePersons(id, details) {
      this.who = id;
      this.details = details
    },
    updateLast(data) {
      this.last = data;
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/style/pages/home.scss';
</style>
