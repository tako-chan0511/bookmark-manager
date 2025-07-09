<template>
  <div class="dashboard">
    <h1>My Bookmarks</h1>

    <!-- 1. 検索ボックス -->
    <input
      v-model="keyword"
      type="text"
      placeholder="検索…タイトル／説明文を含む"
      class="search"
    />

    <!-- 2. タグ絞り込み: チップ方式 -->
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
      <button v-if="selectedTags.length" class="clear" @click="clearTags">
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

// チップ選択トグル
function toggleTag(tag: string) {
  const i = selectedTags.value.indexOf(tag)
  if (i === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(i, 1)
  }
}

// 選択タグをクリア
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

/* タグチップ */
.tag-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.chip {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  background: #eef;
  color: #226;
  border-radius: 16px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}
.chip:hover {
  background: #dde;
}
.chip.active {
  background: #007acc;
  color: #fff;
}
.clear-btn {
  padding: 0.4rem 0.8rem;
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}
.clear-btn:hover {
  background: #e5e5e5;
}
</style>
