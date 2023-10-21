<template>
  <div class="w-100vw h-100vh rel">
    <div class="abs top-0 left-0 w-100 fr ai-c fg-1 jc-c" style="z-index: 1; background-color: #24292f; box-shadow: 0 2px 4px 0 rgba(0,0,0,0.2); height: 50px">
      <spacer/>

      <button v-if="!user" class="btn" @click="showAuthDialog">
        <icon class="icon">fas fa-user@16</icon>
      </button>

      <router-link to="/">
        <button class="btn">
          <icon class="icon">fas fa-home@16</icon>
        </button>
      </router-link>

      <router-link v-if="myFeed" :to="myFeed">
        <button class="btn">
          <icon class="icon">fab fa-blogger-b@16</icon>
        </button>
      </router-link>

      <button class="btn" @click="showContact">
        <icon class="icon">fas fa-phone@16</icon>
      </button>
      <spacer/>
    </div>
    <div class="rel h-100" style="padding-top: 50px">
      <div class="w-100 h-100 ovf-h" style="z-index: 1">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script setup>
import {computed} from 'vue';
import {user} from '@/appState';
import dialog from '@/components/UiLib/Api/dialog';
import Icon from '@/components/UiLib/Icon';
import Spacer from '@/components/UiLib/Spacer';
import ContactInfo from '@/components/ContactInfo';
import {showAuthDialog} from '@/appState';

const myFeed = computed(() => user.value && `/newfeed`);
const open = url => window.open(url, '_blank')
const showContact = async () => await dialog.show({component: ContactInfo})
</script>
<style scoped>
.btn {
  padding: 0;
  width: 30px;
  height: 30px;
  border-radius: 20px;
  background: none;
  border: none;
}

.icon {
  color: #999 !important;
}

.active {
  text-shadow: 0 0 4px #fff;
  color: #fff !important;
}
</style>
