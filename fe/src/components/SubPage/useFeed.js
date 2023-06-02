import {useRoute} from 'vue-router';
import {categoryAPI} from '@/logic/api';
import {ref, computed, onBeforeMount, onMounted} from 'vue';
import {user} from '@/appState';

export default function () {
  const route = useRoute()

  const uid = route.query.uid || (user.value && user.value._id);
  const categories = ref([])
  const sltCategory = computed(() => route.query.cid || '0')
  const isOwner = computed(() => user.value && user.value._id === uid)

  onBeforeMount(async () => {
    categories.value = [
      {_id: '0', name: 'All', uid: uid },
      ...await categoryAPI.gets(uid)
    ]
  })

  return {
    uid,
    isOwner,
    categories,
    sltCategory
  }
}
