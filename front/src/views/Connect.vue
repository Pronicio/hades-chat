<template>
  <section>
    <div class="modal">
      <form v-on:submit.prevent="setName" class="content">
        <h1>What is your name ?</h1>
        <input type="text" id="name" name="name" required minlength="4" maxlength="18" v-model="name">
        <div class="save">
          <input type="checkbox" id="saves" name="saves" v-model="save_session">
          <label for="saves">Save session</label>
        </div>
        <button @click="setName">Validate !</button>
      </form>
    </div>
  </section>
</template>

<script>
export default {
  name: "Connect",
  data: function () {
    return {
      name: null,
      save_session: false
    }
  },
  methods: {
    setName() {
      if (!this.name) return false
      if (this.name.length <= 4 || this.name.length > 18) {
        return false
      }

      localStorage.setItem('name', this.name)
      localStorage.setItem('save_session', this.save_session)
      this.$router.push('/')
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/style/pages/connect.scss';
</style>
