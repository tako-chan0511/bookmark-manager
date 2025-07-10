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
    <button type="submit" :disabled="submitting" class="submit">
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
const tagString   = ref('')   // ← カンマ区切りでタグ文字列を管理
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
    2fr    /* タイトル */
    2fr    /* URL */
    1fr    /* サムネイル */
    auto   /* 追加ボタン */
  ;
  grid-template-rows:
    auto   /* 1行目 */
    auto   /* 2行目: タグ */
    auto   /* 3行目: 説明 */
  ;
  grid-template-areas:
    "title url image submit"
    "tags-input tags-input tags-input tags-input"
    "description description description description";
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.title        { grid-area: title; }
.url          { grid-area: url; }
.image        { grid-area: image; }
.submit       { grid-area: submit; }
.tags-input   { grid-area: tags-input; }
.description  { grid-area: description; }

input, textarea, button {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button.submit {
  background: #007acc;
  color: #fff;
  border: none;
  cursor: pointer;
}
</style>
