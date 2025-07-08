<template>
  <div>
    <h2>My Bookmarks</h2>
    <div v-if="loading">読み込み中…</div>
    <ul v-else class="bookmark-list">
      <li v-for="bm in bookmarks" :key="bm.id" class="bookmark-item">
        <a :href="bm.url" target="_blank">{{ bm.title }}</a>
        <p v-if="bm.description">{{ bm.description }}</p>
        <img v-if="bm.image_url" :src="bm.image_url" alt="thumbnail" class="thumb"/>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/supabase/supabase'

const props = defineProps<{ reload: boolean }>()
const emits = defineEmits<['loaded']>()

const bookmarks = ref<any[]>([])
const loading = ref(false)

async function loadBookmarks() {
  loading.value = true
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id,title,url,description,image_url,created_at')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Bookmark fetch error:', error)
  } else {
    bookmarks.value = data!
  }
  loading.value = false
  emits('loaded')
}

onMounted(loadBookmarks)
watch(() => props.reload, loadBookmarks)
</script>

<style scoped>
.bookmark-list {
  list-style: none;
  padding: 0;
}
.bookmark-item {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}
.thumb {
  max-width: 120px;
  margin-top: 0.5rem;
}
</style>
