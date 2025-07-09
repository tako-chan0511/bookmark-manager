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
  // --- 省略: 既存処理をそのまま ---
  // フォームクリア＆通知
  title.value = url.value = image_url.value = description.value = tagString.value = ''
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
:global([data-theme="dark"]) input,
:global([data-theme="dark"]) textarea {
  background: #2a2a2a;
  border-color: #444;
  color: #eee;
}
:global([data-theme="dark"]) .btn--primary {
  background: #3399ff;
  border-color: #3399ff;
  color: #fff;
}
:global([data-theme="dark"]) .btn--primary:hover:not(:disabled) {
  background: #1f7cd6;
  border-color: #1f7cd6;
}
:global([data-theme="dark"]) .btn--primary:disabled {
  background: #335a8f;
  border-color: #335a8f;
}
</style>
