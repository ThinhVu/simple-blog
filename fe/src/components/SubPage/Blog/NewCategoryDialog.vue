<template>
  <div class="bc-gray-2 mx-a fc fg-1 px-2 py-2" style="min-width: 500px;">
    <txt v-model="name" placeholder="Name"/>
    <txt v-model="tags" placeholder="Tags"/>
    <div class="fr ai-c jc-fe fg-1">
      <button @click="cancel">Cancel</button>
      <button @click="add">Add</button>
    </div>
  </div>
</template>
<script setup>
import {ref} from 'vue';
import {compact} from 'lodash';
import Txt from '@/components/UiLib/Txt';

const emit = defineEmits(['close'])

const name = ref('')
const tags = ref('')

const cancel = () => emit('close')
const add = () => emit('close', {
  name: name.value,
  tags: compact(tags.value.split(','))
})
</script>
