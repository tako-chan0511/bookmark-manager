<template>
  <form @submit.prevent="addBookmark" class="form">
    <input v-model="title" placeholder="タイトル" required />
    <input v-model="url" type="url" placeholder="https://example.com" required />
    <button type="submit" :disabled="submitting">
      {{ submitting ? '追加中…' : '追加' }}
    </button>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/supabase/supabase'

const emits = defineEmits(['added'] as const)
const title = ref('')
const url = ref('')
const submitting = ref(false)
const errorMsg = ref('')

async function addBookmark() {
  submitting.value = true
  errorMsg.value = ''
  const { error } = await supabase
    .from('bookmarks')
    .insert({ title: title.value, url: url.value })
  submitting.value = false

  if (error) {
    errorMsg.value = error.message
  } else {
    title.value = ''
    url.value = ''
    emits('added')
  }
}
</script>

<style scoped>
.form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
input {
  flex: 1;
  padding: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
}
.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
