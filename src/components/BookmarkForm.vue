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

const emits = defineEmits(['added'] as const)

const title       = ref('')
const url         = ref('')
const image_url   = ref('')
const description = ref('')
const tagString   = ref('')
const submitting  = ref(false)

async function addBookmark() {
  submitting.value = true

// 1) ブックマーク登録＆ID取得
  const insertRes = await supabase
    .from("bookmarks")
    .insert({
      title:       title.value,
      url:         url.value,
      image_url:   image_url.value || null,
      description: description.value || null,
    })
    .select("id");
  const err1 = insertRes.error;
  const bm = insertRes.data?.[0];
  if (err1 || !bm) {
    console.error("追加エラー:", err1);
    submitting.value = false;
    return;
  }
  // 2) カンマ区切り文字列 → string[] に変換
  const names = tagString.value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  if (names.length) {
    // 3) tagsテーブルに upsert → まだないタグは作成
    const { error: err2 } = await supabase
      .from('tags')
      .upsert(names.map(name => ({ name })), { onConflict: 'name' })
    if (err2) {
      console.error('タグ upsert エラー', err2)
    } else {
      // 4) upsert済みタグのIDを取得
      const { data: tagRows, error: err3 } = await supabase
        .from('tags')
        .select('id,name')
        .in('name', names)
      if (err3 || !tagRows) {
        console.error('タグ取得エラー', err3)
      } else {
        // 5) bookmark_tags ピボットにリンクを挿入
        const links = tagRows.map(t => ({
          bookmark_id: bm.id,
          tag_id:      t.id,
        }))
        const { error: err4 } = await supabase
          .from('bookmark_tags')
          .insert(links)
        if (err4) console.error('リンク登録エラー', err4)
      }
    }
  }

  // フォームクリア＆親コンポーネントへ通知
  title.value       = ''
  url.value         = ''
  image_url.value   = ''
  description.value = ''
  tagString.value   = ''
  emits('added')
  submitting.value = false
}
</script>

<style scoped>
.form {
  display: grid;
  grid-template-columns:
    2fr 2fr 1fr auto;
  grid-template-areas:
    "title url image submit"
    "tags-input tags-input tags-input tags-input"
    "description description description description";
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.title       { grid-area: title; }
.url         { grid-area: url; }
.image       { grid-area: image; }
.submit      { grid-area: submit; }
.tags-input  { grid-area: tags-input; }
.description { grid-area: description; }

input, textarea {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  background: var(--bg-input, white);
  color: var(--text, #333);
}

/* 共通ボタンスタイル */
.btn {
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}

/* プライマリーボタン (追加など) */
.btn--primary {
  background: var(--accent-color, #007acc);
  color: white;
  border-color: var(--accent-color, #007acc);
}
.btn--primary:hover:not(:disabled) {
  background: #005fa3;
  border-color: #005fa3;
}
.btn--primary:disabled {
  background: #8ebfef;
  border-color: #8ebfef;
  cursor: not-allowed;
}
/* ダークモード調整 */
:global([data-theme="dark"]) .form {
  & input,
  & textarea {
    background: #2a2a2a;
    border-color: #444;
    color: #eee; /* ← これで文字が白っぽくなります */
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
  }
}
</style>
