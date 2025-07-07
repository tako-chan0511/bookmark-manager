<template>
  <div id="app-container">
    <AuthForm />
    </div>
</template>

<script setup lang="ts">
import AuthForm from '@/components/AuthForm.vue';
</script>

<style>
/* グローバルなスタイル */
#app-container {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}
</style>