<template>
  <div id="app">
    <header class="app-header">
      <nav>
        <router-link to="/">Home</router-link>

        <!-- guest(サンドボックス)は user なしでも Dashboard を使えるので Login 導線は残す -->
        <router-link v-if="!user && !isGuest" to="/login">Login</router-link>

        <span v-else class="user-info">
          <!-- ★ isSandbox → isGuest に統一 -->
          <template v-if="isGuest">🧪 サンドボックスモード</template>
          <template v-else>ようこそ、{{ user?.email }} さん</template>

          <!-- ★ signOut 直呼びではなく、logout/leaveSandbox を使う -->
          <button v-if="isGuest" @click="leaveSandbox">サンドボックス終了</button>
          <button v-else @click="logout">ログアウト</button>
        </span>

        <!-- ダーク／ライト切り替え -->
        <button class="theme-toggle" @click="toggleTheme">
          {{ theme === 'light' ? '🌙 ダークモード' : '☀️ ライトモード' }}
        </button>
      </nav>
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/supabase/useAuth'
import { useAppMode } from '@/session/appMode'

const router = useRouter()
const { user, signOut } = useAuth()
const { isGuest, exitGuest } = useAppMode()

const logout = async () => {
  await signOut()
  exitGuest() // 念のため guest を解除（混乱防止）
  router.push({ name: 'Login' })
}

const leaveSandbox = () => {
  exitGuest()
  router.push({ name: 'Login' })
}

// テーマ管理（現状踏襲）
const theme = ref(localStorage.getItem('theme') || 'light')
watch(
  theme,
  (val) => {
    document.documentElement.setAttribute('data-theme', val)
    localStorage.setItem('theme', val)
  },
  { immediate: true }
)

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<style scoped>
.app-header {
  background: var(--bg-card);
  padding: 0.5rem 1rem;
  color: var(--text-main);
}
nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}
nav a {
  color: var(--accent-color);
  text-decoration: none;
}
.user-info {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
button {
  cursor: pointer;
}
.theme-toggle {
  margin-left: auto;
  background: var(--btn-bg);
  color: var(--btn-text);
  border: 1px solid var(--btn-border);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
}
</style>
