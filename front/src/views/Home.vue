<template>
  <Contacts />
  <Room />
</template>

<script>
import Room from '../components/Room.vue'
import Contacts from '../components/Contacts.vue'

export default {
  name: "Home",
  components: {
    Room, Contacts
  }
}
</script>

<style scoped lang="scss">
@import '../assets/style/pages/home.scss';
</style>
