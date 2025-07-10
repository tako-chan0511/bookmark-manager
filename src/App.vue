<template>
  <div id="app">
    <header class="app-header">
      <nav>
        <router-link to="/">Home</router-link>
        <router-link v-if="!user" to="/login">Login</router-link>
        <span v-else class="user-info">
          <template v-if="isSandbox">🧪 サンドボックスモード</template>
          <template v-else>ようこそ、{{ user.email }} さん</template>
          <button @click="signOut">ログアウト</button>
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
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/supabase/useAuth'

const { user, signOut } = useAuth()
// サンドボックス用ダミーアカウント
const sandboxEmail = 'hara.keisuke2@i.softbank.jp'
const isSandbox = computed(() => user.value?.email === sandboxEmail)

// テーマ管理
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
