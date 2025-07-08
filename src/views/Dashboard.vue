<template>
  <div class="dashboard">
    <h1>My Bookmarks</h1>

    <!-- 検索ボックス -->
    <input
      v-model="keyword"
      type="text"
      placeholder="検索…タイトル／説明文を含む"
      class="search"
    />

    <BookmarkForm @added="refresh" />
    <BookmarkList
      :reloadFlag="reloadFlag"
      :filterKeyword="keyword"
      @deleted="refresh"
      @updated="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BookmarkForm from '@/components/BookmarkForm.vue'
import BookmarkList from '@/components/BookmarkList.vue'

const keyword    = ref('')
const reloadFlag = ref(false)
function refresh() {
  reloadFlag.value = !reloadFlag.value
}
</script>

<style scoped>
.search {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
}
</style>
