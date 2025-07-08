<template>
  <div id="app">
    <header class="app-header">
      <nav>
        <router-link to="/">Home</router-link>
        <router-link v-if="!user" to="/login">Login</router-link>
        <span v-else class="user-info">
          ようこそ、{{ user.email }} さん
          <button @click="signOut">ログアウト</button>
        </span>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/supabase/useAuth'
const { user, signOut } = useAuth()
</script>

<style scoped>
.app-header {
  padding: 0.5rem 1rem;
  background: #f5f5f5;
}
nav {
  display: flex;
  align-items: center;
  gap: 1rem;
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
</style>