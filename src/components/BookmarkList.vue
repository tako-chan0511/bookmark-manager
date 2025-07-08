<!-- src/components/BookmarkList.vue -->
<template>
  <ul class="list">
    <li v-if="loading">読み込み中…</li>
    <!-- 絞り込み後のリストをループ -->
    <li
      v-else
      v-for="bm in filteredBookmarks"
      :key="bm.id"
      class="item"
    >
      <!-- 編集モード -->
      <template v-if="editingId === bm.id">
        <input v-model="editTitle" placeholder="タイトル" required />
        <input v-model="editUrl"   placeholder="URL"    required />
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
        <!-- タグ編集用フィールド -->
        <input
          v-model="editTags"
          placeholder="タグ (カンマ区切り)"
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
          <div v-if="bm.tags?.length" class="tags">
            <span v-for="tag in bm.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/supabase/supabase'

// ① プロップスに検索キーワード & タグ絞り込みを受け取る
const props = defineProps<{
  reloadFlag:    boolean
  filterKeyword: string
  filterTags:    string[]
}>()

const emits = defineEmits(['deleted', 'updated'] as const)

const bookmarks       = ref<any[]>([])
const loading         = ref(false)

// 編集モード用ステート
const editingId       = ref<string | null>(null)
const editTitle       = ref('')
const editUrl         = ref('')
const editDescription = ref('')
const editImageUrl    = ref('')
// ② タグ編集用文字列フィールド
const editTags        = ref('')

// ③ データ取得 (tagsリレーション込み)
async function load() {
  loading.value = true
  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      id,
      title,
      url,
      description,
      image_url,
      created_at,
      tags(name)
    `)
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

// ④ 絞り込み用 computed
const filteredBookmarks = computed(() => {
  return bookmarks.value.filter(bm => {
    // キーワード検索 (タイトル or 説明)
    const kw = props.filterKeyword.toLowerCase()
    if (kw) {
      const hay = (bm.title + ' ' + (bm.description || '')).toLowerCase()
      if (!hay.includes(kw)) return false
    }
    // タグ絞り込み (いずれか一つ以上含む)
    if (props.filterTags.length) {
      if (!bm.tags.some((t: string) => props.filterTags.includes(t))) {
        return false
      }
    }
    return true
  })
})

// 編集開始
function startEdit(bm: any) {
  editingId.value       = bm.id
  editTitle.value       = bm.title
  editUrl.value         = bm.url
  editDescription.value = bm.description || ''
  editImageUrl.value    = bm.image_url || ''
  editTags.value        = bm.tags.join(', ')
}

// 編集キャンセル
function cancelEdit() {
  editingId.value = null
}

// 編集保存
async function saveEdit(id: string) {
  if (!editTitle.value || !editUrl.value) return

  // ⑤ タグ文字列 → 配列に分解
  const tagsArray = editTags.value
    .split(',')
    .map(s => s.trim())
    .filter(s => s)

  // 1) ブックマーク本体を更新
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

  // ★ 2) タグテーブルへ存在しないタグを upsert（自動作成）
  if (tagsArray.length) {
    await supabase
      .from('tags')
      .upsert(tagsArray.map(name => ({ name })), { onConflict: 'name' })
  }

  // 3) 既存タグのクリア
  await supabase
    .from('bookmark_tags')
    .delete()
    .eq('bookmark_id', id)

  // 4) tagsテーブルから該当タグを取得
  const { data: tagRows } = await supabase
    .from('tags')
    .select('id, name')
    .in('name', tagsArray)

  // 5) pivotテーブルに再挿入
  if (tagRows) {
    await supabase
      .from('bookmark_tags')
      .insert(
        tagRows.map((t: any) => ({
          bookmark_id: id,
          tag_id:      t.id
        }))
      )
  }

  editingId.value = null
  emits('updated')
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

/* 情報 */
.info {
  flex: 1;
}
.desc {
  margin: 0.25rem 0;
  color: #555;
}

/* タグ */
.tags {
  margin: 0.25rem 0;
}
.tag {
  display: inline-block;
  background: #f0f0f0;
  color: #333;
  padding: 0.125rem 0.5rem;
  margin-right: 0.25rem;
  border-radius: 2px;
  font-size: 0.875rem;
}

/* 編集・削除ボタン */
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
