<template>
  <div class="filter" @click="$emit('close', true);"></div>
  <section class="modal">
    <h1>{{ props.title }}</h1>
    <form v-on:submit.prevent="sendForm">
      <input type="text" minlength="4" maxlength="24" v-model="text">
      <button type="submit">Validate !</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toast-notification';

const $toast = useToast();
const props = defineProps([ 'title' ])
const emit = defineEmits([ 'submit', 'close' ])
const text = ref()

function sendForm() {
  if (!text.value || (/^\s+$/g).test(text.value)) {
    $toast.clear();
    return $toast.open({
      message: 'Please enter a non-empty message.',
      type: "error",
      position: "top-right"
    });
  }

  emit("submit", text.value)
  emit("close", true)
}
</script>

<style scoped lang="scss">
@import '../assets/style/components/modal.scss';
</style>
