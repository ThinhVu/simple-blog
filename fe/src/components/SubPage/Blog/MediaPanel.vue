<template>
  <div :style="containerStyle" ref="container">
    <imgx :src="url" v-for="({url, style}, i) in mediaModel" :key="url"
         :style="style"
         @click="viewPhoto(i)"/>
  </div>
</template>
<script setup>
import {ref, computed} from 'vue';
import dialog from '@/components/UiLib/Api/dialog';
import Imgx from '@/components/Imgx';
import MediaSlide from '@/components/MediaSlide';
import Icon from '@/components/UiLib/Icon';

const props = defineProps({
  photos: Array,
  height: [Number, String]
})

const container = ref()
const containerWidth = computed(() => container.value && container.value.clientWidth || 700)
const areaTemplate = computed(() => {
  const mediaQty = props.photos && props.photos.length || 0
  if (mediaQty === 1) return '\'a\''
  if (mediaQty === 2) return '\'a b\''
  if (mediaQty === 3) return '\'a b\' \'a c\''
  if (mediaQty === 4) return '\'a b\' \'c d\''
  return '\'a b\' \'a b\' \'a c\' \'d c\' \'d e\' \'d e\''
})
const containerStyle = computed(() => ({
  maxHeight: `${props.height}px`,
  display: 'grid',
  gridTemplateAreas: areaTemplate.value,
  gridGap: '2px',
  background: '#bbb',
  borderTop: '1px dashed #ddd'
}))
const area = ['a', 'b', 'c', 'd', 'e']
const areaQty = area.length
const mediaModel = computed(() => {
  const rs = []
  const mediaQty = props.photos && props.photos.length || 0
  for (let i = 0; i < mediaQty && i < areaQty; ++i) {
    rs.push({
      url: props.photos[i],
      style: {
        gridArea: area[i],
        width: '100%',
        maxHeight: `700px`,
        objectFit: mediaQty === 1 ? 'contain' : 'cover',
      }
    })
  }
  return rs;
})
const viewPhoto = async idx => {
  console.log('viewPhoto', idx)
  await dialog.show({
    component: {
      components: {MediaSlide, Icon},
      setup(_, {emit}) {
        return () => <div class="w-100 h-100 fr ai-c jc-c bc-black px-4 rel  clickable">
          <media-slide media={props.photos} idx={idx}/>
          <icon class="abs" style="top: 20px; right: 20px"
                onClick={() => emit('close')}>fas fa-x@30:#fff</icon>
        </div>
      }
    }
  })
}
</script>
