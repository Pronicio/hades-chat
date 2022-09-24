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
      <div class="picture"
           :style="`background: #fefefe url('${picture}') no-repeat; background-size: 14.375rem;`"></div>
    </div>
  </section>
</template>

<script>
import { Dropzone } from "dropzone";

export default {
  name: "Connect",
  data: function () {
    return {
      name: null,
      save_session: false,
      picture: "src/assets/images/icons/user-plus.svg"
    }
  },
  mounted() {
    const dropzone = new Dropzone(".picture", {
      url: `${import.meta.env.VITE_API_URI}/upload_image`,
      uploadMultiple: false,
      createImageThumbnails: false,
      disablePreviews: true
    });

    dropzone.on("complete", async (file) => {
      const data = JSON.parse(file.xhr.response)
      if (data.success) {
        this.picture = data.link;
      }
    });

    dropzone.on("addedfile", async (file) => {
      this.picture = "src/assets/images/loader.gif"
    });
  },
  methods: {
    setName() {
      if (!this.name) return false
      if (this.name.length < 4 || this.name.length > 18) {
        return false
      }

      const storage = this.save_session ? localStorage : sessionStorage

      storage.setItem('name', this.name)
      if (this.picture.includes("imgur")) {
        storage.setItem('picture', this.picture)
      }

      if (this.save_session) storage.setItem('save_session', this.save_session)
      this.$router.push('/')
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/style/pages/connect.scss';
</style>
