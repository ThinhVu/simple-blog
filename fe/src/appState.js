import {ref, computed} from 'vue';
export const user = ref();
export const isAdmin = computed(() => user.value && user.value.role === 'Admin');
export const authDialogVisible = ref();
export const showAuthDialog = () => authDialogVisible.value = true;
export const hideAuthDialog = () => authDialogVisible.value = false;
