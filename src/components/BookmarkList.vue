<!-- src/components/BookmarkList.vue -->
<template>
  <ul class="list">
    <li v-if="loading">読み込み中…</li>
    <li v-else v-for="bm in bookmarks" :key="bm.id" class="item">
      <a :href="bm.url" target="_blank">{{ bm.title }}</a>
      <small>（{{ new Date(bm.created_at).toLocaleString() }}）</small>
      <button @click="deleteBookmark(bm.id)" class="delete">削除</button>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/supabase/supabase'

const props = defineProps<{ reloadFlag: boolean }>()
const emits = defineEmits(['deleted'] as const)

const bookmarks = ref<any[]>([])
const loading   = ref(false)

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

async function deleteBookmark(id: string) {
  if (!confirm('本当に削除しますか？')) return
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)

  if (error) {
    alert('削除エラー: ' + error.message)
  } else {
    emits('deleted')  // Dashboard.vue で再読み込み
  }
}

onMounted(load)
watch(() => props.reloadFlag, load)
</script>

<style scoped>
.list { list-style: none; padding: 0 }
.item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
.delete {
  margin-left: auto;
  background: #e00;
  color: #fff;
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}
.delete:hover { opacity: 0.8 }
</style>
