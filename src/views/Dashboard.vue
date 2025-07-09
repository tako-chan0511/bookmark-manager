<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">

    <!-- 検索セクション -->
    <section class="section section--search">
      <h2 class="section__title">🔍 検索</h2>
      <input
        v-model="keyword"
        type="text"
        placeholder="タイトル／説明文を含むキーワードで検索"
        class="search"
      />
      <div class="chips">
        <span
          v-for="tag in tags"
          :key="tag"
          class="chip"
          :class="{ active: selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </span>
        <button
          v-if="selectedTags.length"
          class="chip chip--clear"
          @click="clearTags"
        >
          解除
        </button>
      </div>
    </section>

    <!-- 追加フォームセクション -->
    <section class="section section--form">
      <h2 class="section__title">➕ ブックマークを追加</h2>
      <BookmarkForm @added="refresh" />
    </section>

    <!-- 一覧セクション -->
    <section class="section section--list">
      <h2 class="section__title">📑 登録済みブックマーク</h2>
      <BookmarkList
        :reloadFlag="reloadFlag"
        :filterKeyword="keyword"
        :filterTags="selectedTags"
        @deleted="refresh"
        @updated="refresh"
      />
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BookmarkForm from '@/components/BookmarkForm.vue'
import BookmarkList from '@/components/BookmarkList.vue'
import { supabase } from '@/supabase/supabase'

// 検索
const keyword = ref('')
const tags = ref<string[]>([])
const selectedTags = ref<string[]>([])

// リスト更新フラグ
const reloadFlag = ref(false)
function refresh() {
  reloadFlag.value = !reloadFlag.value
}

// タグのON/OFF
function toggleTag(tag: string) {
  const i = selectedTags.value.indexOf(tag)
  if (i === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(i, 1)
}
function clearTags() {
  selectedTags.value = []
}

// 初回タグロード
async function loadTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('name')
    .order('name', { ascending: true })
  if (!error && data) {
    tags.value = data.map(t => t.name)
  }
}
onMounted(loadTags)
</script>

<style scoped>
.dashboard {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

/* セクションごとの共通スタイル */
.section {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.section__title {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  color: #333;
}

/* 検索入力 */
.search {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* チップ */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chip {
  padding: 0.25rem 0.75rem;
  background: #f3f3f3;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}
.chip.active {
  background: #007acc;
  color: #fff;
}
.chip--clear {
  background: transparent;
  color: #007acc;
  border: none;
  padding: 0.25rem;
  margin-left: auto;
}

/* フォーム・一覧部は元のスタイルが反映されます */
</style>
