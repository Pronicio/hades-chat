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
      url: "/",
      uploadMultiple: false,
      createImageThumbnails: false,
      disablePreviews: true
    });

    dropzone.on("addedfile", async (file) => {
      const b64 = await this.getBase64(file)

      const headers = new Headers();
      headers.append("Authorization", `Client-ID ${import.meta.env.VITE_IMGUR_CLIENT_ID}`);

      const formData = new FormData();
      formData.append("image", b64.substring(b64.indexOf('base64,') + 7));

      const requestOptions = {
        method: 'POST',
        headers: headers,
        body: formData,
        redirect: 'follow'
      };

      fetch("https://api.imgur.com/3/image", requestOptions)
          .then(response => response.json())
          .then(res => {
            console.log(res.data.link)
            this.picture = res.data.link;
            console.log(this.picture)
          })
          .catch(error => console.log('error', error));
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
        console.log(true)
        storage.setItem('picture', this.picture)
      }

      if (this.save_session) storage.setItem('save_session', this.save_session)
      this.$router.push('/')
    },
    getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/style/pages/connect.scss';
</style>
