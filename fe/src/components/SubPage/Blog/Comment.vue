<template>
  <!-- Comment -->
  <div :key="comment._id" class="fr fg-1">
    <div>
      <img style="width: 32px; height: 32px; border-radius: 20px; border: 1px solid #444"
           :src="comment.byUser.avatar" draggable="false"/>
    </div>

    <div>
      <div class="bc-gray-3 br-6 px-1 py-1">
        <p class="fw-6">{{ comment.byUser.fullName }}</p>
        <content :value="comment.text"/>
      </div>

      <div class="fs-s fw-6 fr ai-c fg-3 mt-1">
        <react-button :post="comment"/>
        <span @click="showAddNewComment">Reply</span>
        <span><time-span :value="comment.createdAt"></time-span></span>
        <react-detail :react="comment.react"/>
      </div>
    </div>

    <tooltip>
      <template #content>
        <div class="fc fg-1">
          <div v-if="canDelete" @click="deleteComment">Delete</div>
        </div>
      </template>
      <span>...</span>
    </tooltip>
  </div>

  <!-- Child comments -->
  <div style="margin-left: 32px">
    <div v-if="comment.comments && comment.comments.length" class="px-2">
      <comment v-for="cmt in comments" :key="cmt._id"
               :comment="cmt" :parent="comment"
               @add-comment-to-parent="onAddNewCommentToParent"
               @deleted="removeCommentFromUI"/>
    </div>
    <new-comment v-if="canAddChildComment && addNewCommentVisible"
                 :post="comment"
                 v-model:content="newCommentText"
                 @add="onNewCommentAdded"/>
  </div>
</template>
<script setup>
import _ from 'lodash';
import {ref, computed} from 'vue';
import {postAPI} from '@/logic/api';
import ReactButton from './ReactButton';
import Tooltip from '@/components/UiLib/Tooltip';
import NewComment from './NewComment';
import Content from './Content';
import {user} from '@/appState';
import ReactDetail from '@/components/SubPage/Blog/ReactDetail';
import TimeSpan from '@/components/TimeSpan';

const props = defineProps({
  comment: Object,
  parent: Object
})
const emit = defineEmits(['addCommentToParent', 'deleted'])
const newCommentText = ref('')
const comments = ref(props.comment.comments || [])
const canAddChildComment = computed(() => !props.parent || props.parent.type === 'TL')
const addNewCommentVisible = ref(false)
const showAddNewComment = () => {
  if (canAddChildComment.value) {
    console.log('can add child comment')
    addNewCommentVisible.value = true
    updateReplyContent(props.comment)
  } else {
    console.log('emit add comment to parent')
    emit('addCommentToParent', props.comment)
  }
}
const onAddNewCommentToParent = childCmt => {
  updateReplyContent(childCmt)
  showAddNewComment()
}
const updateReplyContent = cmt => newCommentText.value = `[@${cmt.byUser._id}=${cmt.byUser.fullName}] `
const onNewCommentAdded = cmt => {
  props.comment.comments.push(cmt)
  emit('')
}

const canDelete = computed(() => {
  try {
    return user.value && user.value._id === props.comment.byUser._id
  } catch (e) {
    console.error(e)
  }
})

const deleteComment = async () => {
  await postAPI.remove(props.comment._id)
  emit('deleted', props.comment._id)
}
const removeCommentFromUI = cmtId => {
  comments.value = _.filter(comments.value, c => c._id !== cmtId)
}
</script>
