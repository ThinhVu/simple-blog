<template>
  <tooltip v-if="canReact">
    <div>Like</div>
    <template #content>
      <div class="mx-a px-2 py-2 fc fg-1">
        <div @click="doReact('like')"  class="react-btn px-1 br-1 fr ai-c"><span class="ico mr-1 act-like"/>like</div>
        <div @click="doReact('love')"  class="react-btn px-1 br-1 fr ai-c"><span class="ico mr-1 act-love"/>love</div>
        <div @click="doReact('care')"  class="react-btn px-1 br-1 fr ai-c"><span class="ico mr-1 act-care"/>care</div>
        <div @click="doReact('haha')"  class="react-btn px-1 br-1 fr ai-c"><span class="ico mr-1 act-haha"/>haha</div>
        <div @click="doReact('wow')"   class="react-btn px-1 br-1 fr ai-c"><span class="ico mr-1 act-wow"/>wow</div>
        <div @click="doReact('sad')"   class="react-btn px-1 br-1 fr ai-c"><span class="ico mr-1 act-sad"/>sad</div>
        <div @click="doReact('angry')" class="react-btn px-1 br-1 fr ai-c"><span class="ico mr-1 act-angry"/>angry</div>
      </div>
    </template>
  </tooltip>
</template>
<script setup>
import {computed} from 'vue';
import {postAPI} from '@/logic/api';
import Tooltip from '@/components/UiLib/Tooltip';
import {sumFields} from '@/logic/utils';
import {user} from '@/appState';

const props = defineProps({post: Object})
const canReact = computed(() => user.value)
const doReact = async (act) => {
  const reactResult = await postAPI.react(props.post._id, act)
  props.post.react = sumFields(props.post.react, reactResult)
}
</script>
<style scoped>
.react-btn {
  padding-top: 3px;
  padding-bottom: 3px;
}
.react-btn:hover {
  background: #fff;
}
</style>
