<template>
  <form @submit.prevent="addBookmark" class="form">
    <!-- 1行目: タイトル／URL／サムネイル／追加ボタン -->
    <input
      v-model="title"
      placeholder="タイトル"
      required
      class="title"
    />
    <input
      v-model="url"
      type="url"
      placeholder="https://example.com"
      required
      class="url"
    />
    <input
      v-model="image_url"
      type="url"
      placeholder="サムネイルURL (任意)"
      class="image"
    />
    <button
      type="submit"
      :disabled="submitting || !title || !url"
      class="btn btn--primary submit"
    >
      {{ submitting ? '追加中…' : '追加' }}
    </button>

    <!-- 2行目: タグ入力 -->
    <input
      v-model="tagString"
      placeholder="タグをカンマ区切りで入力 (例: vue, supabase)"
      class="tags-input"
    />

    <!-- 3行目: 説明欄 -->
    <textarea
      v-model="description"
      placeholder="説明 (任意)"
      class="description"
      rows="3"
    />
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/supabase/supabase'
import { useAppMode } from '@/session/appMode'

const emits = defineEmits(['added'] as const)

const { isGuest } = useAppMode()

const title       = ref('')
const url         = ref('')
const image_url   = ref('')
const description = ref('')
const tagString   = ref('')
const submitting  = ref(false)

const SANDBOX_STORE_KEY = 'sandbox_bookmarks'

function parseTags(s: string): string[] {
  // 重複除去しつつ順序維持
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of s.split(',').map(x => x.trim()).filter(Boolean)) {
    if (!seen.has(t)) {
      seen.add(t)
      out.push(t)
    }
  }
  return out
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function clearForm() {
  title.value       = ''
  url.value         = ''
  image_url.value   = ''
  description.value = ''
  tagString.value   = ''
}

async function addBookmark() {
  if (submitting.value) return
  submitting.value = true

  try {
    const tags = parseTags(tagString.value)

    // ------------------------
    // Guest(サンドボックス) → localStorage に保存
    // ------------------------
    if (isGuest.value) {
      const store = JSON.parse(localStorage.getItem(SANDBOX_STORE_KEY) || '[]')
      store.unshift({
        id: newId(),
        title: title.value,
        url: url.value,
        image_url: image_url.value || null,
        description: description.value || null,
        tags,
        created_at: new Date().toISOString(),
      })
      localStorage.setItem(SANDBOX_STORE_KEY, JSON.stringify(store))

      clearForm()
      emits('added')
      return
    }

    // ------------------------
    // Auth(通常) → Supabase に保存
    // ------------------------
    // 1) bookmarks 登録＆ID取得
    const { data: bookmarkRow, error: err1 } = await supabase
      .from('bookmarks')
      .insert({
        title: title.value,
        url: url.value,
        image_url: image_url.value || null,
        description: description.value || null,
      })
      .select('id')
      .single()

    if (err1 || !bookmarkRow) {
      console.error('追加エラー(bookmarks):', err1)
      return
    }

    // 2) tags / bookmark_tags 登録（任意）
    if (tags.length) {
      // tags テーブルに upsert（name が unique 前提）
      const { error: err2 } = await supabase
        .from('tags')
        .upsert(tags.map(name => ({ name })), { onConflict: 'name' })

      if (err2) {
        console.error('追加エラー(tags upsert):', err2)
      } else {
        // upsert した tags の id を取得して pivot を作る
        const { data: tagRows, error: err3 } = await supabase
          .from('tags')
          .select('id,name')
          .in('name', tags)

        if (err3 || !tagRows) {
          console.error('追加エラー(tags select):', err3)
        } else if (tagRows.length) {
          const links = tagRows.map(t => ({
            bookmark_id: bookmarkRow.id,
            tag_id: t.id,
          }))
          const { error: err4 } = await supabase
            .from('bookmark_tags')
            .insert(links)

          if (err4) console.error('追加エラー(bookmark_tags insert):', err4)
        }
      }
    }

    clearForm()
    emits('added')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.form {
  display: grid;
  grid-template-columns:
    2fr 2fr 2fr auto;
  grid-template-rows:
    auto auto auto;
  grid-template-areas:
    "title url image submit"
    "tags  tags tags  tags"
    "desc  desc desc  desc";
  gap: 0.75rem;

  & .title       { grid-area: title; }
  & .url         { grid-area: url; }
  & .image       { grid-area: image; }
  & .submit      { grid-area: submit; }
  & .tags-input  { grid-area: tags; }
  & .description { grid-area: desc; }

  input, textarea {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg);
    color: var(--text);
    outline: none;
  }

  textarea {
    resize: vertical;
  }

  .btn {
    padding: 0.6rem 0.9rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    cursor: pointer;
  }
  & .btn--primary {
    background: #3399ff;
    border-color: #3399ff;
    color: #fff;
  }
  & .btn--primary:hover:not(:disabled) {
    background: #1f7cd6;
    border-color: #1f7cd6;
  }
  & .btn--primary:disabled {
    background: #335a8f;
    border-color: #335a8f;
    cursor: not-allowed;
  }
}
</style>
