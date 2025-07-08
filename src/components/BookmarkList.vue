<template>
  <div>
    <div v-if="loading">読み込み中…</div>
    <ul v-else class="list">
      <li v-for="bm in bookmarks" :key="bm.id" class="item">
        <a :href="bm.url" target="_blank">{{ bm.title }}</a>
        <small>（{{ new Date(bm.created_at).toLocaleString() }}）</small>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/supabase/supabase'

const props = defineProps<{ reloadFlag: boolean }>()
const bookmarks = ref<any[]>([])
const loading = ref(false)

async function load() {
  loading.value = true
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id,title,url,created_at')
    .order('created_at', { ascending: false })
  if (error) console.error(error)
  else bookmarks.value = data!
  loading.value = false
}

onMounted(load)
watch(() => props.reloadFlag, load)
</script>

<style scoped>
.list {
  list-style: none;
  padding: 0;
}
.item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
</style>
