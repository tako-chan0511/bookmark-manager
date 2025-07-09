<template>
  <div class="dashboard">
    <!-- 検索セクション -->
    <section class="section section--search">
      <h2 class="section__title">🔍 ブックマークを検索</h2>
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

// タグON/OFF
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
  if (!error && data) tags.value = data.map(t => t.name)
}
onMounted(loadTags)
</script>

<style scoped>
.dashboard {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  color: var(--text-main);
}
.section__title {
  position: relative;
  padding-left: 1.5rem;
}
.section__title::before {
  content: '';
  position: absolute;
  left: 0; top: 0.2rem;
  width: 0.25rem; height: 1.2rem;
  background: var(--accent-color);
  border-radius: 2px;
}

/* 検索 */
.search {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  background: var(--bg-input);
  color: var(--text-main);
  border: 1px solid var(--border-color);
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
  background: var(--tag-bg);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}
.chip.active {
  background: var(--tag-active-bg);
  color: var(--tag-active-text);
}
.chip--clear {
  background: transparent;
  color: var(--accent-color);
  border: none;
  margin-left: auto;
}
</style>
