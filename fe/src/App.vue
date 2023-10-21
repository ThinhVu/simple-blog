<template>
  <div class="r fc h-100 w-100">
    <api/>
    <auth-dialog v-if="authDialogVisible" @close="hideAuthDialog"/>
    <dock style="background: #F0F2F5">
      <div class="w-100 h-100">
        <router-view #default="{ Component }">
          <component :is="Component"/>
        </router-view>
      </div>
    </dock>
  </div>
</template>
<script setup>
import Dock from '@/components/Dock';
import Api from '@/components/UiLib/Api/Api';
import AuthDialog from '@/components/AuthDialog';
import {authDialogVisible, hideAuthDialog} from '@/appState';
</script>
