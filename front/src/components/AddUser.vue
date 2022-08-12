<template>
  <section class="pop">
    <div class="modal">
      <form v-on:submit.prevent="addUser" class="content">
        <h1>What is the name of the user ?</h1>
        <input type="text" id="name" name="name" required minlength="36" v-model="id">
        <button @click="addUser">Validate !</button>
      </form>
    </div>
  </section>
</template>

<script>

export default {
  name: "AddUser",
  data: function () {
    return {
      id: null
    }
  },
  methods: {
    addUser: function () {
      this.$emit('addUser', this.id)
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/style/components/adduser.scss';
@import '../assets/style/pages/connect.scss';
</style>

