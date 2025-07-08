<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <h1>My Bookmarks</h1>

    <!-- 1. キーワード検索 -->
    <input
      v-model="keyword"
      type="text"
      placeholder="検索…タイトル／説明文を含む"
      class="search"
    />

    <!-- 2. タグで絞り込み -->
    <div class="tag-filter">
      <label for="tag-filter" class="tag-filter-label">タグで絞り込み:</label>
      <select
        id="tag-filter"
        v-model="selectedTags"
        multiple
        class="filter-tags"
      >
        <option
          v-for="tag in tags"
          :key="tag"
          :value="tag"
        >{{ tag }}</option>
      </select>
      <!-- クリアボタン -->
      <button type="button" class="clear-btn" @click="clearTags">
        クリア
      </button>
    </div>

    <!-- 3. ブックマーク追加フォーム -->
    <BookmarkForm @added="refresh" />

    <!-- 4. ブックマークリスト -->
    <BookmarkList
      :reloadFlag="reloadFlag"
      :filterKeyword="keyword"
      :filterTags="selectedTags"
      @deleted="refresh"
      @updated="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BookmarkForm from '@/components/BookmarkForm.vue'
import BookmarkList from '@/components/BookmarkList.vue'
import { supabase } from '@/supabase/supabase'

// キーワード検索用
const keyword = ref('')

// タグ絞り込み用
const tags = ref<string[]>([])
const selectedTags = ref<string[]>([])

// ブックマークリスト再読み込みトリガー
const reloadFlag = ref(false)
function refresh() {
  reloadFlag.value = !reloadFlag.value
}

// 選択タグのクリア
function clearTags() {
  selectedTags.value = []
}

// 初期表示時に tags テーブルから全タグ名を取得
async function loadTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('name')
    .order('name', { ascending: true })

  if (!error && data) {
    tags.value = data.map((t: { name: string }) => t.name)
  }
}

onMounted(loadTags)
</script>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  margin-bottom: 1rem;
}

/* 検索ボックス */
.search {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* タグ絞り込み */
.tag-filter {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
.tag-filter-label {
  margin-right: 0.5rem;
  font-weight: bold;
}
.filter-tags {
  flex: 1;
  height: 4rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.clear-btn {
  margin-left: 0.5rem;
  padding: 0.5rem 1rem;
  background: #e0e0e0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}
.clear-btn:hover {
  background: #d0d0d0;
}
</style>
