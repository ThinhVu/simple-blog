<template>
  <div class="w-100 h-100 ovf-y-s hide-scroll-bar">
    <post v-if="postData" :post="postData" style="max-width: 700px; margin: 20px auto"/>
  </div>
</template>
<script setup>
import Post from '@/components/SubPage/Blog/Post';
import {useRoute} from 'vue-router';
import {ref, onMounted, onServerPrefetch} from 'vue';
import {postAPI} from '@/logic/api';

const route = useRoute()
const postData = ref()
const postId = route.params.id

const loadPost = async id => postData.value = await postAPI.get(id)

onMounted(() => loadPost(postId))
onServerPrefetch(() => loadPost(postId))
</script>
