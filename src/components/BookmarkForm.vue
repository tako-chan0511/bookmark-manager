<template>
  <form @submit.prevent="addBookmark" class="form">
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

    <!-- ２行目に説明欄だけを全幅で -->
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
const submitting  = ref(false)
const errorMsg    = ref('')

async function addBookmark() {
  submitting.value = true
  const { error } = await supabase
    .from('bookmarks')
    .insert({
      title:       title.value,
      url:         url.value,
      image_url:   image_url.value || null,
      description: description.value || null,
    })
  submitting.value = false

  if (error) {
    console.error(error)
  } else {
    title.value = url.value = image_url.value = description.value = ''
    emits('added')
  }
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
    auto   /* 入力行 */
    auto   /* 説明行 */
  ;
  grid-template-areas:
    "title url image submit"
    "description description description description";
  gap: 0.5rem;
  margin-bottom: 1rem;
}

/* 各要素をグリッドエリアに当てはめる */
.title       { grid-area: title; }
.url         { grid-area: url; }
.image       { grid-area: image; }
.submit      { grid-area: submit; }
.description { grid-area: description; }

/* ベーススタイル */
input, textarea {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 追加ボタン */
button.submit {
  padding: 0.5rem 1rem;
  background: #007acc;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 説明欄は高さを確保 */
textarea.description {
  width: 100%;
  min-height: 4.5rem;
  resize: vertical;
}
</style>
