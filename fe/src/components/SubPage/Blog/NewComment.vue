<template>
  <div v-if="canComment" class="fr fg-1 px-2">
    <txt-area :model-value="content" @update:modelValue="updateContent"
              placeholder="add your comment..."
              class="f1 br-6"
              style="min-height: 60px; border: 1px solid #aaa"/>
    <button @click="addComment">Add</button>
  </div>
  <p v-else class="fs-s ta-c clickable" @click="showAuthDialog">Login to comment</p>
</template>
<script setup>
import {ref, watch, computed} from 'vue';
import {postAPI} from '@/logic/api';
import {user} from '@/appState';
import TxtArea from '@/components/UiLib/TxtArea';
import {showAuthDialog} from '@/appState';

const props = defineProps({
  post: Object,
  content: String
})
const emit = defineEmits(['add', 'update:content'])
const canComment = computed(() => user.value)
const commentContent = ref(props.content || '')
const updateContent = v => {
  commentContent.value = v
  emit('update:content', v)
}
watch(() => props.content, v => commentContent.value = v)

const addComment = async () => {
  const payload = {text: commentContent.value, of: props.post._id, type: 'C'}

  const cmt = await postAPI.create(payload)
  cmt.comments = []
  emit('add', cmt)

  commentContent.value = ''
  emit('update:content', '')
}
</script>
