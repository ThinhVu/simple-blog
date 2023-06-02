<template>
  <blog-template>
    <div class="fc" style="max-width: 700px; margin: 0 auto">
      <new-post v-if="isOwner" class="w-100 bc-gray-1 ta-l clickable mt-2" @post="createPost" :available-categories="categories"/>
      <post v-for="post in posts" style="margin-top: 14px" :key="post._id" :post="post" @deleted="onPostDeleted"/>
      <div v-if="canLoadMorePost" class="clickable c-gray-9 mb-2" @click="loadMorePosts">more</div>
      <dot3 v-if="loadingPost" class="c-gray-9"/>
    </div>
  </blog-template>
</template>
<script setup>
import BlogTemplate from '@/components/SubPage/Blog/BlogTemplate';
import NewPost from '@/components/SubPage/Blog/NewPost';
import Dot3 from '@/components/UiLib/Dot3';
import Post from '@/components/SubPage/Blog/Post';
import {nextTick, ref, watch} from 'vue';
import {postAPI} from '@/logic/api';
import _ from 'lodash';
import useFeed from '@/components/SubPage/useFeed';
const {uid, isOwner, categories, sltCategory} = useFeed()

const loadingPost = ref()
const canLoadMorePost = ref()
const page = ref(1)
const posts = ref([])

const createPost = async (payload, cb) => {
  try {
    payload.type = 'TL';
    const postResult = await postAPI.create(payload)
    posts.value.unshift(postResult)
    cb && cb(true)
  } catch (e) {
    cb && cb(false)
  }
}
const onPostDeleted = (postId) => posts.value = _.filter(posts.value, p => p._id !== postId)
const loadPosts = async () => {
  loadingPost.value = true;
  const result = await postAPI.gets(uid, sltCategory.value, page.value)
  setTimeout(() => loadingPost.value = false, 500)
  if (result.length) {
    console.log('has posts, enabled load more')
    await nextTick(() => canLoadMorePost.value = true)
  } else {
    console.log('end of posts, disabled load more')
    canLoadMorePost.value = false
  }
  return result;
}

const loadMorePosts = async () => {
  console.log('loadMorePosts')
  page.value++;
  posts.value.push(...await loadPosts());
}

watch([sltCategory, categories], async ([v]) => {
  console.log('on change')
  canLoadMorePost.value = false;
  page.value = 1;
  posts.value = await loadPosts()
})

</script>
