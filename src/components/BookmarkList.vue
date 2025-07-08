<template>
  <ul class="list">
    <li v-if="loading">読み込み中…</li>
    <li v-else v-for="bm in bookmarks" :key="bm.id" class="item">
      <!-- 編集モード -->
      <template v-if="editingId === bm.id">
        <input v-model="editTitle" />
        <input v-model="editUrl" />
        <button @click="saveEdit(bm.id)">保存</button>
        <button @click="cancelEdit">キャンセル</button>
      </template>

      <!-- 通常表示モード -->
      <template v-else>
        <a :href="bm.url" target="_blank">{{ bm.title }}</a>
        <small>（{{ new Date(bm.created_at).toLocaleString() }}）</small>
        <button @click="startEdit(bm)">編集</button>
        <button @click="deleteBookmark(bm.id)">削除</button>
      </template>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/supabase/supabase'

const props = defineProps<{ reloadFlag: boolean }>()
const emits = defineEmits(['deleted', 'updated'] as const)

const bookmarks = ref<any[]>([])
const loading   = ref(false)

// 編集用ステート
const editingId  = ref<string | null>(null)
const editTitle  = ref('')
const editUrl    = ref('')

async function load() {
  loading.value = true
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id,title,url,created_at')
    .order('created_at', { ascending: false })
  if (!error) bookmarks.value = data!
  loading.value = false
}

// 編集開始
function startEdit(bm: any) {
  editingId.value = bm.id
  editTitle.value = bm.title
  editUrl.value   = bm.url
}

// 編集キャンセル
function cancelEdit() {
  editingId.value = null
}

// 編集保存
async function saveEdit(id: string) {
  if (!editTitle.value || !editUrl.value) return
  const { error } = await supabase
    .from('bookmarks')
    .update({ title: editTitle.value, url: editUrl.value })
    .eq('id', id)
  if (error) {
    alert('更新エラー: ' + error.message)
  } else {
    editingId.value = null
    emits('updated')
  }
}

// 削除
async function deleteBookmark(id: string) {
  if (!confirm('本当に削除しますか？')) return
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('id', id)
  if (!error) emits('deleted')
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
input { padding: 0.25rem; }
button { padding: 0.25rem 0.5rem; }
</style>
