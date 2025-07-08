<template>
  <div class="login">
    <h1>Login</h1>
    <!-- すでに作成済みの AuthForm を使う例 -->
    <AuthForm />
  </div>
</template>

<script setup lang="ts">
import AuthForm from '@/components/AuthForm.vue'
</script>

<style scoped>
.login {
  padding: 1rem;
}
</style>
