<template>
  <Contacts @changePersons="changePersons" />
  <Room :who="who"/>
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
      who: 'global'
    }
  },
  methods: {
    changePersons(id) {
      this.who = id
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/style/pages/home.scss';
</style>
