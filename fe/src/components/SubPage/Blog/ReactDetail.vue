<template>
  <template v-for="(count, type) in react">
    <div v-if="count">
      <div class="fr ai-c">
        <span :class="`ico act-${type}`" style="margin-right: 2px"/>
        {{count}}
      </div>
    </div>
  </template>
</template>
<script setup>
const props = defineProps({react: Object})
</script>
