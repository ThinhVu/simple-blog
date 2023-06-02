<template>
  <div class="bc-white br-1 px-5 py-5 fr ai-c fg-2 mx-a">
    <a href="https://www.linkedin.com/in/thinh-vu-08849724a" target="_blank">
      <button class="btn">
        <icon class="icon">fab fa-linkedin@16</icon>
      </button>
    </a>
    <a href="https://www.github.com/thinhvu">
      <button class="btn">
        <icon class="icon">fab fa-github@16</icon>
      </button>
    </a>
    <a href="https://facebook.com/i21cen">
      <button class="btn">
        <icon class="icon">fab fa-facebook@16</icon>
      </button>
    </a>
    <a href="https://www.youtube.com/channel/UCbvrUljGA0l0C3RF7puYUng">
      <button class="btn">
        <icon class="icon">fab fa-youtube@16</icon>
      </button>
    </a>
    <a href="https://twitter.com/thinhvux">
      <button class="btn">
        <icon class="icon">fab fa-twitter@16</icon>
      </button>
    </a>
    <icon class="icon clickable" @click="$emit('close')">fas fa-close@16</icon>
  </div>
</template>
<script setup>
import Icon from '@/components/UiLib/Icon';
</script>
