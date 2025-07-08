<template>
  <div class="login-container">
    <h1>Login</h1>
    <div class="auth-form">
      <input v-model="email" type="email" placeholder="Email" />
      <input v-model="password" type="password" placeholder="Password" />
      <div class="buttons">
        <button @click="onSignIn">ログイン</button>
        <button @click="onSignUp">新規登録</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/supabase/useAuth'

const router = useRouter()
const { signIn, signUp } = useAuth()
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)

// ログイン
const onSignIn = async () => {
  error.value = null
  const { data: { session }, error: e } = await signIn(email.value, password.value)
  if (e) {
    error.value = 'ログインエラー: ' + e.message
  } else if (session) {
    // ログイン成功後、ブックマーク画面へリダイレクト
    router.push({ name: 'Home' })
  }
}

// 新規登録
const onSignUp = async () => {
  error.value = null
  const { error: e } = await signUp(email.value, password.value)
  if (e) {
    error.value = '登録エラー: ' + e.message
  } else {
    alert('登録OK！ メールを確認してください')
  }
}
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.buttons {
  display: flex;
  gap: 0.5rem;
}
button {
  flex: 1;
  padding: 0.5rem;
  border: none;
  background-color: #007acc;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}
.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
