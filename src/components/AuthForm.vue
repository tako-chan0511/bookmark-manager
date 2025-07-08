<template>
  <div class="auth-form">
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />
    <button @click="onSignIn">ログイン</button>
    <button @click="onSignUp">新規登録</button>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/supabase/useAuth'

const { signIn, signUp } = useAuth()
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)

const onSignIn = async () => {
  error.value = null
  const { error: e } = await signIn(email.value, password.value)
  if (e) error.value = e.message
}

const onSignUp = async () => {
  error.value = null
  const { error: e } = await signUp(email.value, password.value)
  if (e) error.value = e.message
  else alert('登録OK！メールを確認してください')
}
</script>

<style scoped>
.auth-form { display: flex; flex-direction: column; gap: 0.5rem; }
</style>
