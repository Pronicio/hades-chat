<template>
  <div class="headbar">
    <div class="left">
      <div class="back" @click="backToContacts"></div>
      <img class="picture" :src="details.picture" alt="Picture" width="50" height="50" />
      <div class="infos">
        <h4>{{ details.username }}</h4>
        <p>{{ details.last?.time }}</p>
      </div>
    </div>
    <div class="right">
      <div id="search"></div>
      <div id="call"></div>
      <div id="more"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Headbar",
  props: [ 'details' ],
  methods: {
    backToContacts() {
      if (window.innerWidth <= 1130) {
        document.getElementById("contacts").style.width = '100vw';
        document.getElementById("room").style.display = 'none';
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/style/components/headbar.scss';
</style>
