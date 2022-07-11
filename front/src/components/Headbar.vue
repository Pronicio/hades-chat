<template>
  <div class="headbar">
    <div class="right">
      <img :src="details.picture" alt="Picture" width="50" height="50" />
      <div class="infos">
        <h4>{{ details.username }}</h4>
        <p>{{ details.last.time }}</p>
      </div>
    </div>
    <div class="left">
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
}
</script>

<style scoped lang="scss">
@import '../assets/style/components/headbar.scss';
</style>
