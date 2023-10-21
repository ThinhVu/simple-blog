<template>
  <div class="px-4 py-4 br-10 mx-a fc fg-1" style="background: rgba(255,255,255); min-width: 400px">
    <img v-if="avatar" :src="avatar"
         style="width: 40px; height: 40px; border-radius: 20px; border: 1px solid #000;"/>
    <div v-else class="fr ai-c" style="gap: 10px" @click="selectAvatar">
      <div class="fr ai-c jc-c"
           style="width: 40px; height: 40px; border-radius: 20px; border: 1px solid #000; cursor: pointer">
        <span style="font-size: 20px">+</span>
      </div>
      <span>Upload your avatar</span>
    </div>

    <p><txt v-model="fullName" class="w-100" placeholder="Your full name"/></p>
    <div class="fr ai-c fg-1 mt-2">
      <button @click="close">x</button>
      <spacer/>
      <button @click="finish">Finish</button>
    </div>
  </div>
</template>
<script setup>
import {ref} from 'vue';
import {user} from '@/appState';
import notification from '@/components/UiLib/Api/notification';
import {userAPI} from '@/logic/api';
import Spacer from '@/components/UiLib/Spacer';
import Txt from '@/components/UiLib/Txt';
import {openUploadFileDialog, uploadFile} from '@/components/UiLib/FileUpload/fileUploadLogic';
const emit = defineEmits(['close'])
const avatar = ref(user.value && user.value.avatar || '')
const fullName = ref(user.value && user.value.fullName || '')

const pendingAvatar = ref()
const selectAvatar = () => openUploadFileDialog({mimeType: 'image/*', multiple: false}, (files) => {
  const file = files[0]
  pendingAvatar.value = file
  console.log('pendingAvatar', pendingAvatar.value)
  const url = window.URL.createObjectURL(file)
  console.log('url', url)
  avatar.value = url
})

const close = () => emit('close')
const finish = async () => {
  try {
    const avatarUrl =  await (uploadFile([pendingAvatar.value]))[0];
    await userAPI.update({avatar: avatarUrl, fullName: fullName.value})
    emit('close')
  } catch (e) {
    notification.err(e)
  }
}
</script>
