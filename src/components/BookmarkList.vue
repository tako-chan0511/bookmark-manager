<!-- src/components/BookmarkList.vue -->
<template>
  <ul class="list">
    <li v-if="loading">読み込み中…</li>
    <li
      v-else
      v-for="bm in bookmarks"
      :key="bm.id"
      class="item"
    >
      <!-- 編集モード -->
      <template v-if="editingId === bm.id">
        <input v-model="editTitle"     placeholder="タイトル" />
        <input v-model="editUrl"       placeholder="URL" />
        <textarea
          v-model="editDescription"
          placeholder="説明（任意）"
          rows="2"
        />
        <input
          v-model="editImageUrl"
          type="url"
          placeholder="サムネイルURL（任意）"
        />
        <button @click="saveEdit(bm.id)">保存</button>
        <button @click="cancelEdit">キャンセル</button>
      </template>

      <!-- 通常表示モード -->
      <template v-else>
        <div v-if="bm.image_url" class="thumb-wrapper">
          <img :src="bm.image_url" class="thumb" alt="サムネイル" />
        </div>
        <div class="info">
          <a :href="bm.url" target="_blank">{{ bm.title }}</a>
          <p v-if="bm.description" class="desc">{{ bm.description }}</p>
          <small>（{{ new Date(bm.created_at).toLocaleString() }}）</small>
        </div>
        <div class="actions">
          <button @click="startEdit(bm)">編集</button>
          <button @click="deleteBookmark(bm.id)">削除</button>
        </div>
      </template>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/supabase/supabase'

const props = defineProps<{ reloadFlag: boolean }>()
const emits = defineEmits(['deleted', 'updated'] as const)

const bookmarks      = ref<any[]>([])
const loading        = ref(false)

// 編集用ステート
const editingId       = ref<string | null>(null)
const editTitle       = ref('')
const editUrl         = ref('')
const editDescription = ref('')
const editImageUrl    = ref('')

async function load() {
  loading.value = true
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id,title,url,description,image_url,created_at')
    .order('created_at', { ascending: false })
  if (!error && data) bookmarks.value = data
  loading.value = false
}

// 編集開始
function startEdit(bm: any) {
  editingId.value       = bm.id
  editTitle.value       = bm.title
  editUrl.value         = bm.url
  editDescription.value = bm.description || ''
  editImageUrl.value    = bm.image_url || ''
}

// 編集キャンセル
function cancelEdit() {
  editingId.value = null
}

// 編集保存
async function saveEdit(id: string) {
  // 必須はタイトルとURLだけ
  if (!editTitle.value || !editUrl.value) return

  const { error } = await supabase
    .from('bookmarks')
    .update({
      title:       editTitle.value,
      url:         editUrl.value,
      description: editDescription.value || null,
      image_url:   editImageUrl.value   || null,
    })
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
.list {
  list-style: none;
  padding: 0;
}
.item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
/* サムネイル */
.thumb-wrapper {
  flex-shrink: 0;
}
.thumb {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}
.info {
  flex: 1;
}
.desc {
  margin: 0.25rem 0;
  color: #555;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
/* フォーム要素 */
input,
textarea {
  padding: 0.25rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
textarea {
  resize: vertical;
}
button {
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}
</style>
