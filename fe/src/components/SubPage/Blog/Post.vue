<template>
  <div class="w-100 bc-white ta-l pt-2 br-1" style="box-shadow: 0 1px 2px rgba(0,0,0, 0.2)">
    <!-- Avatar -->
    <div class="fr fg-1 px-2">
      <div>
        <imgx style="width: 40px; height: 40px; border-radius: 20px; border: 1px solid #444"
             :src="post.byUser.avatar" draggable="false"/>
      </div>
      <div>
        <p class="fw-6">{{ post.byUser.fullName }}</p>
        <router-link :to="`/post/${post._id}`" class="fs-s c-gray-6 clickable">
          <time-span :value="post.createdAt"/>
        </router-link>
      </div>
      <spacer/>
      <div>
        <span v-if="post.textEn" class="px-2 clickable" :class="showEn ? 'bc-gray-4' : 'bc-gray-2'" @click="showVietnamese(true)">En</span>
        <span v-if="post.textVi" class="px-2 clickable" :class="showEn ? 'bc-gray-2' : 'bc-gray-4'" @click="showVietnamese(false)">Vi</span>
      </div>
    </div>

    <!-- Content -->
    <div class="my-2 px-2 w-100 ovf-x-h markdown-body" v-if="post.textEn || post.textVi">
      <markdown v-if="showEn && post.textEn" :source="post.textEn" html linkify breaks/>
      <markdown v-else-if=" post.textVi" :source="post.textVi" html linkify breaks/>
    </div>

    <audio v-if="post.audio" :src="post.audio" controls class="mt-2"/>

    <media-panel v-if="post.photos && post.photos.length" :photos="post.photos" height="700" class="mt-2"/>

    <!-- TAGS -->
    <div class="fr ai-c fg-1 px-2" v-if="post.tags && post.tags.length">
      <span v-for="tag in post.tags" :key="tag" class="c-b-9">#{{ tag }}</span>
    </div>

    <h-line/>

    <!-- Action -->
    <div class="fr ai-c fg-2 px-2 py-1 fs-s">
      <react-detail :react="post.react"/>
      <spacer/>
      <div class="clickable" @click="onShowComments">Comments ({{ post.commentCount }})</div>
      <react-button :post="post"/>
      <div class="clickable" @click="sharePost">Share</div>
      <template v-if="isOwner">
        <div @click="pinPost">{{post.pinned ? 'Unpin' : 'Pin' }}</div>
        <div @click="removePost">Delete</div>
      </template>
    </div>

    <h-line/>

    <!-- Comment section -->
    <div v-if="showComments && comments.length" class="fc fg-1 px-2 mt-1">
      <comment v-for="cmt in comments" :comment="cmt" :key="cmt._id" :parent="post" @deleted="removeCommentFromUI"/>
    </div>

    <div v-if="canShowMoreComments" class="ta-c my-1 fw-6" @click="loadMoreComments">see more</div>

    <new-comment v-if="showComments" v-model:content="newCommentContent" :post="post" @add="onNewCommentAdded" class="my-1"/>
  </div>
</template>
<script setup>
import _ from 'lodash';
import Markdown from 'vue3-markdown-it';
import {ref, computed} from 'vue';
import {postAPI} from '@/logic/api';
import {user} from '@/appState';
import HLine from '@/components/UiLib/HLine';
import Spacer from '@/components/UiLib/Spacer';
import ReactButton from './ReactButton';
import ReactDetail from './ReactDetail';
import MediaPanel from './MediaPanel';
import Comment from './Comment';
import NewComment from './NewComment';
import TimeSpan from '@/components/TimeSpan';
import Imgx from '@/components/Imgx';

const props = defineProps({post: Object})
const emit = defineEmits(['deleted'])
const isOwner = computed(() => user.value && user.value._id === props.post.byUser._id)

const showEn = ref(!!props.post.textEn)
const showVietnamese = v => showEn.value = v
const showComments = ref(false)
const commentPage = ref(0)
const comments = ref([])
const onShowComments = () => {
  showComments.value = true
  loadMoreComments()
}
const canShowMoreComments = ref(false)
const loadMoreComments = async () => {
  commentPage.value++;
  const loadedComments = await postAPI.getComments(props.post._id, commentPage.value)
  canShowMoreComments.value = loadedComments.length === 10; // maximum comments per page
  comments.value.push(...loadedComments)
}
const newCommentContent = ref('')
const onNewCommentAdded = cmt => comments.value.push(cmt)
const removeCommentFromUI = cmtId => comments.value = _.filter(comments.value, c => c._id !== cmtId)
const sharePost = async () => {
  const postUrl = window.encodeURI(`${window.location.origin}/post/${props.post._id}?`)
  window.open(`https://www.facebook.com/dialog/share?app_id=87741124305&href=${postUrl}%26feature%3Dshare&display=popup`)
}
// admin fn
const pinPost = async () => {
  if (props.post.pinned) {
    await postAPI.update(props.post._id, { pinned: false })
    props.post.pinned = false
  } else {
    await postAPI.update(props.post._id, { pinned: true })
    props.post.pinned = true
  }
}
const removePost = async () => {
  await postAPI.remove(props.post._id)
  emit('deleted', props.post._id)
}
</script>
