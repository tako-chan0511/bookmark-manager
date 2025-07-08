<template>
  <div class="dashboard">
    <h1>My Bookmarks</h1>
    <BookmarkForm @added="refresh" />
    <BookmarkList :reloadFlag="reloadFlag" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BookmarkForm from '@/components/BookmarkForm.vue'
import BookmarkList from '@/components/BookmarkList.vue'

const reloadFlag = ref(false)
function refresh() {
  reloadFlag.value = !reloadFlag.value
}
</script>

<style scoped>
.dashboard {
  max-width: 600px;
  margin: auto;
  padding: 1rem;
}
</style>
