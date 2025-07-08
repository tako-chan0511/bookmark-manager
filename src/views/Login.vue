<!-- src/views/Login.vue -->
<template>
  <div class="login">
    <h1>Login</h1>
    <form @submit.prevent="onSubmit">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">{{ loading ? 'ログイン中…' : 'ログイン' }}</button>
    </form>
    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/supabase/useAuth'

const router = useRouter()
const { signIn, user } = useAuth()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function onSubmit() {
  loading.value = true
  errorMsg.value = ''
  const { error } = await signIn(email.value, password.value)
  loading.value = false

  if (error) {
    errorMsg.value = error.message
  } else {
    // サインイン成功 → ダッシュボードへ遷移
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.error { color: red; }
</style>
