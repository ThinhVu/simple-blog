<template>
  <div class="fc fg-1 pt-2 br-1 ovf-h bc-white" style="box-shadow: 0 1px 2px rgba(0,0,0, 0.2)">
    <div class="px-2">
      <div class="fr ai-c mb-2">
        <span class="px-2" :class="vieContent ? 'bc-gray-4' : 'bc-gray-2'" @click="vieContent = true">Vi</span>
        <span class="px-2" :class="vieContent ? 'bc-gray-2' : 'bc-gray-4'" @click="vieContent = false">En</span>
        <spacer/>
        <span @click="addCategory">Add to category ({{ pendingCategories.length }})</span>
      </div>

      <!-- content -->
      <template v-if="vieContent">
        <txt-area class="w-100" style="min-height: 100px" v-model="textVi"/>
        <template v-if="textVi">
          <h-line/>
          <markdown class="markdown-body" :source="textVi" html linkify breaks/>
        </template>
      </template>
      <template v-else>
        <txt-area class="w-100" style="min-height: 100px" v-model="textEn"/>
        <template v-if="textEn">
          <h-line/>
          <markdown class="markdown-body" :source="textEn" html linkify breaks/>
        </template>
      </template>

      <div data-name="audio" v-if="post.audio">
        <audio :src="post.audio" controls/>
        <icon @click="removeAudio">fas fa-x@16</icon>
      </div>
      <div data-name="photos" v-if="photos && photos.length">
        <media-panel :src="photos"/>
        <icon @click="removePhotos">fas fa-x@16</icon>
      </div>
    </div>
    <div class="px-2">
      <p class="fr ai-c fg-1" v-if="pendingAudio">
        <span style="width: 125px">1 pending audio</span>
        <icon @click="removePendingAudio">fas fa-x@16</icon>
      </p>
      <p class="fr ai-c fg-1" v-if="pendingPhotos && pendingPhotos.length">
        <span style="width: 125px">{{ pendingPhotos.length }} pending photos</span>
        <icon @click="removePendingPhotos">fas fa-x@16</icon>
      </p>
      <p class="fr ai-c fg-1" v-if="pendingVideos && pendingVideos.length">
        <span style="width: 125px">{{ pendingVideos.length }} pending videos</span>
        <icon @click="removePendingVideos">fas fa-x@16</icon>
      </p>
    </div>
    <div class="ovf-x-s hide-scroll-bar fr ai-c px-2 fg-1 py-1 bc-gray-2">
      <a href="https://janguillermo.github.io/vue3-markdown-it/" target="_blank">?</a>
      <spacer/>
      <button @click="addEmoji" class="bc-white">Emoji</button>
      <button @click="addAudio" class="bc-white">Audio</button>
      <button @click="addPhotos" class="bc-white">Photos</button>
      <button @click="addVideos" class="bc-white">Videos</button>
      <button @click="post" class="bc-b-6 c-gray-0">Post</button>
    </div>
  </div>
</template>
<script setup>
import {compact} from 'lodash';
import {ref} from 'vue';
import TxtArea from '@/components/UiLib/TxtArea';
import MediaPanel from './MediaPanel';
import {openUploadFileDialog, uploadFile} from '@/components/UiLib/FileUpload/fileUploadLogic';
import Icon from '@/components/UiLib/Icon';
import Markdown from 'vue3-markdown-it';
import dialog from '@/components/UiLib/Api/dialog';
import Spacer from '@/components/UiLib/Spacer';
import Emojis from '@/components/UiLib/Emojis';
import HLine from '@/components/UiLib/HLine';

const props = defineProps({
  _id: String,
  categories: Array,
  availableCategories: Array,
  textVi: String,
  textEn: String,
  audio: String,
  photos: {
    type: Array,
    default: []
  },
  videos: {
    type: Array,
    default: []
  },
  tags: {
    type: Array,
    default: []
  }
})
const emit = defineEmits(['post'])

const vieContent = ref(!props.textEn)
const textVi = ref('');
const textEn = ref('');
const append = txt => {
  if (vieContent.value) {
    textVi.value += txt;
  } else {
    textEn.value += txt;
  }
}

const pendingCategories = ref(props.categories || []);
const audio = ref(props.audio)
const photos = ref(props.photos || [])
const videos = ref(props.videos || [])
const tagStr = ref((props.tags || []).join(','))

const pendingAudio = ref()
const pendingPhotos = ref([])
const pendingVideos = ref([])

const addCategory = async () => {
  pendingCategories.value = await dialog.show((_, {emit}) => {
    const arr2Obj = arr => (arr || []).reduce((o, v) => {
      o[v] = true;
      return o;
    }, {})
    const obj2Arr = obj => Object.keys(obj).reduce((a, k) => {
      if (obj[k]) a.push(k);
      return a;
    }, [])
    const categories = ref(arr2Obj(pendingCategories.value))

    return () =>
        <div class="fc fg-1 bc-white px-2 py-2 mx-a br-10" style="min-width: 300px; max-width: 500px; border: 1px solid #aaa">
          <div class="fr fg-1 fw-w">
            {props.availableCategories.map(c => <span
                class="fr ai-c fg-1 clickable" key={c._id}
                onClick={() => categories.value[c._id] = !categories.value[c._id]}>
              <input type="checkbox" checked={categories.value[c._id]} style="pointer-events: none"/>
              {c.name}
            </span>)}
          </div>

          <div class="fr ai-c fg-1 jc-fe">
            <button onClick={() => emit('close', [])}>Cancel</button>
            <button onClick={() => emit('close', obj2Arr(categories.value))}>OK</button>
          </div>
        </div>
  })
}
const addEmoji = async () => {
  await dialog.show({
    component: Emojis, data: {
      onEmoji: emoji => append(`:${emoji}:`)
    }
  })
}
const addAudio = async () => openUploadFileDialog({multiple: false, mimeType: 'audio/*'}, files => pendingAudio.value = files[0]);
const addPhotos = async () => openUploadFileDialog({multiple: true, mimeType: 'image/*'}, files => pendingPhotos.value.push(...files));
const addVideos = async () => openUploadFileDialog({multiple: true, mimeType: 'video/*'}, files => pendingVideos.value.push(...files));

const removeAudio = () => audio.value = null;
const removePhotos = () => photos.value = [];
const removePendingAudio = () => pendingAudio.value = null;
const removePendingPhotos = () => pendingPhotos.value = [];
const removePendingVideos = () => pendingVideos.value = [];

const post = async () => {
  const payload = {
    textVi: textVi.value,
    textEn: textEn.value,
    categories: pendingCategories.value,
    tags: compact(tagStr.value.split(','))
  }

  if (pendingAudio.value) {
    console.log('uploading audio...');
    payload.audio = (await Promise.all(uploadFile([pendingAudio.value])))[0];
  } else {
    payload.audio = audio.value;
  }

  if (pendingPhotos.value.length) {
    console.log('uploading photos...')
    payload.photos = [...props.photos, ...await Promise.all(uploadFile(pendingPhotos.value))]
  } else {
    payload.photos = photos.value;
  }

  if (pendingVideos.value.length) {
    console.log('uploading videos')
    payload.videeos = [...props.videos, ...await Promise.all(uploadFile(pendingVideos.value))]
  } else {
    payload.videeos = videos.value;
  }

  emit('post', {_id: props._id, ...payload}, (postCreated) => {
    if (postCreated) {
      textEn.value = '';
      textVi.value = '';
      pendingCategories.value = [];
      pendingAudio.value = null;
      pendingPhotos.value = [];
      pendingVideos.value = [];
      tagStr.value = '';
    }
  })
}
</script>
