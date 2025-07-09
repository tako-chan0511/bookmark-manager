<!-- src/components/BookmarkList.vue -->
<template>
  <div class="cards">
    <!-- 読み込み中表示 -->
    <article v-if="loading" class="card loading">読み込み中…</article>

    <!-- カードレイアウトで表示 -->
    <article
      v-else
      v-for="bm in filteredBookmarks"
      :key="bm.id"
      class="card"
    >
      <!-- 編集モード -->
      <div v-if="editingId === bm.id" class="card-edit">
        <input v-model="editTitle" placeholder="タイトル" required />
        <input v-model="editUrl" placeholder="URL" required />
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
        <input
          v-model="editTags"
          placeholder="タグ (カンマ区切り)"
        />
        <div class="edit-actions">
          <button @click="saveEdit(bm.id)">保存</button>
          <button @click="cancelEdit">キャンセル</button>
        </div>
      </div>

      <!-- 通常表示モード -->
      <div v-else class="card-view">
        <div v-if="bm.image_url" class="card-thumb">
          <img :src="bm.image_url" alt="サムネイル" />
        </div>
        <div class="card-body">
          <a :href="bm.url" target="_blank" class="card-title">
            {{ bm.title }}
          </a>
          <p v-if="bm.description" class="card-desc">
            {{ bm.description }}
          </p>
          <div v-if="bm.tags?.length" class="card-tags">
            <span
              v-for="tag in bm.tags"
              :key="tag"
              class="tag-chip"
            >
              {{ tag }}
            </span>
          </div>
          <small class="card-date">
            （{{ new Date(bm.created_at).toLocaleString() }}）
          </small>
        </div>
        <div class="card-actions">
          <button @click="startEdit(bm)">編集</button>
          <button @click="deleteBookmark(bm.id)">削除</button>
        </div>
      </div>
    </article>

    <!-- 絞り込み結果0件時 -->
    <p v-if="!loading && filteredBookmarks.length === 0" class="no-data">
      該当するブックマークがありません。
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/supabase/supabase'

const props = defineProps<{
  reloadFlag:    boolean
  filterKeyword: string
  filterTags:    string[]
}>()
const emits = defineEmits(['deleted', 'updated'] as const)

const bookmarks       = ref<any[]>([])
const loading         = ref(false)
const editingId       = ref<string | null>(null)
const editTitle       = ref('')
const editUrl         = ref('')
const editDescription = ref('')
const editImageUrl    = ref('')
const editTags        = ref('')

// データ取得
async function load() {
  loading.value = true
  const { data, error } = await supabase
    .from('bookmarks')
    .select(
      `
      id,
      title,
      url,
      description,
      image_url,
      created_at,
      tags(name)
    `
    )
    .order('created_at', { ascending: false })

  if (!error && data) {
    bookmarks.value = data.map(item => ({
      ...item,
      tags: item.tags?.map((t: any) => t.name) || []
    }))
  }
  loading.value = false
}

onMounted(load)
watch(() => props.reloadFlag, load)

// フィルタリング
const filteredBookmarks = computed(() =>
  bookmarks.value.filter(bm => {
    const kw = props.filterKeyword.toLowerCase()
    if (kw) {
      const hay = (bm.title + ' ' + (bm.description || '')).toLowerCase()
      if (!hay.includes(kw)) return false
    }
    if (props.filterTags.length) {
      if (!bm.tags.some((t: string) => props.filterTags.includes(t))) {
        return false
      }
    }
    return true
  })
)

function startEdit(bm: any) {
  editingId.value       = bm.id
  editTitle.value       = bm.title
  editUrl.value         = bm.url
  editDescription.value = bm.description || ''
  editImageUrl.value    = bm.image_url || ''
  editTags.value        = bm.tags.join(', ')
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(id: string) {
  if (!editTitle.value || !editUrl.value) return
  const tagsArray = editTags.value.split(',').map(s => s.trim()).filter(s => s)

  const { error: bookErr } = await supabase
    .from('bookmarks')
    .update({
      title:       editTitle.value,
      url:         editUrl.value,
      description: editDescription.value || null,
      image_url:   editImageUrl.value   || null,
    })
    .eq('id', id)

  if (bookErr) {
    alert('更新エラー: ' + bookErr.message)
    return
  }

  if (tagsArray.length) {
    await supabase
      .from('tags')
      .upsert(tagsArray.map(name => ({ name })), { onConflict: 'name' })
      .select('id,name')
  }

  await supabase.from('bookmark_tags').delete().eq('bookmark_id', id)
  const { data: tagRows } = await supabase
    .from('tags')
    .select('id,name')
    .in('name', tagsArray)

  if (tagRows) {
    await supabase
      .from('bookmark_tags')
      .insert(tagRows.map((t: any) => ({ bookmark_id: id, tag_id: t.id })))
  }

  editingId.value = null
  emits('updated')
}

async function deleteBookmark(id: string) {
  if (!confirm('本当に削除しますか？')) return
  const { error } = await supabase.from('bookmarks').delete().eq('id', id)
  if (!error) emits('deleted')
}
</script>

<style scoped>
.cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform .1s ease;
}
.card:hover {
  transform: translateY(-2px);
}
.loading {
  padding: 2rem;
  text-align: center;
  font-style: italic;
  color: #666;
}
.card-thumb img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}
.card-view {
  display: flex;
  flex-direction: column;
}
.card-body {
  padding: 0.75rem;
  flex: 1;
}
.card-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #007acc;
  text-decoration: none;
}
.card-desc {
  margin: 0.5rem 0;
  color: #555;
}
.card-tags {
  margin-bottom: 0.5rem;
}
.tag-chip {
  display: inline-block;
  background: #eef;
  color: #226;
  padding: 0.2rem 0.5rem;
  margin-right: 0.3rem;
  border-radius: 4px;
  font-size: 0.75rem;
}
.card-date {
  font-size: 0.75rem;
  color: #999;
}
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.5rem;
}
.card-actions button {
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}
.card-edit {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
input,
textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
button {
  cursor: pointer;
}
.no-data {
  text-align: center;
  color: #666;
  grid-column: 1 / -1;
}
</style>
