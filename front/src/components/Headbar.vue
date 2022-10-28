<template>
  <div class="headbar">
    <div class="left">
      <div class="back" @click="backToContacts"></div>
      <img class="picture" :src="details.picture" alt="Picture" width="50" height="50"/>
      <div class="infos">
        <h4>{{ details.username }}</h4>
        <p>{{ timeElapsed }}</p>
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
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime'

export default {
  name: "Headbar",
  props: [ 'details', 'last' ],
  data: function () {
    return {
      time: null,
      timeElapsed: null
    }
  },
  mounted() {
    setInterval(this.updateTimeElapsed, 60 * 1000);
  },
  methods: {
    backToContacts() {
      if (window.innerWidth <= 1130) {
        document.getElementById("contacts").style.width = '100vw';
        document.getElementById("room").style.display = 'none';
      }
    },
    updateTimeElapsed() {
      this.timeElapsed = dayjs(this.time).from(dayjs())
    }
  },
  watch: {
    details(value) {
      this.time = value.last?.time;
      this.updateTimeElapsed()
    },
    last(value) {
      this.time = value.time;
      this.updateTimeElapsed()
    }
  },
  setup() {
    dayjs.extend(relativeTime)

    return {
      dayjs
    }
  }
}
</script>

<style scoped lang="scss">
@import '../assets/style/components/headbar.scss';
</style>
