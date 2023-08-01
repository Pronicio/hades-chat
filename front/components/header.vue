<template>
  <div class="header">
    <div class="left">
      <div class="back-icon" @click="$emit('back', true)"></div>
      <img :src="currentContact?.avatar || 'https://i.imgur.com/FkZ8zcY.gif'" alt="">
      <p>{{ currentContact?.username }}</p>
    </div>
    <div class="right">
      <div class="search-icon"></div>
      <div class="more-icon"></div>
      <div class="call-icon"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from "~/store";
import { storeToRefs } from "pinia";

const store = useMainStore();
const { currentContact } = storeToRefs(store);

const emit = defineEmits([ 'back' ])
</script>

<style scoped lang="scss">
@import '../assets/style/components/header.scss';
</style>
