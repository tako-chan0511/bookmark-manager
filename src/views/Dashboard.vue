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
      <h3 class="section__title">タグを選択してください</h3>

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
import { ref, onMounted, watch } from 'vue'
import BookmarkForm from '@/components/BookmarkForm.vue'
import BookmarkList from '@/components/BookmarkList.vue'
import { supabase } from '@/supabase/supabase'
import { useAppMode } from '@/session/appMode'

const { isGuest } = useAppMode()

// 検索
const keyword = ref('')
const tags = ref<string[]>([])
const selectedTags = ref<string[]>([])

// リスト更新フラグ
const reloadFlag = ref(false)

const SANDBOX_STORE_KEY = 'sandbox_bookmarks'

function toggleTag(tag: string) {
  const i = selectedTags.value.indexOf(tag)
  if (i === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(i, 1)
}

function clearTags() {
  selectedTags.value = []
}

async function loadTags() {
  if (isGuest.value) {
    const stored = JSON.parse(localStorage.getItem(SANDBOX_STORE_KEY) || '[]')
    const set = new Set<string>()
    for (const b of stored) {
      for (const t of (b?.tags || [])) {
        if (typeof t === 'string' && t.trim()) set.add(t.trim())
      }
    }
    tags.value = Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'))
    return
  }

  const { data, error } = await supabase
    .from('tags')
    .select('name')
    .order('name', { ascending: true })

  if (!error && data) {
    tags.value = data.map((t: any) => t.name)
  } else {
    tags.value = []
  }
}

async function refresh() {
  // BookmarkList 側の再取得トリガ
  reloadFlag.value = !reloadFlag.value
  // タグ一覧も追随（追加/削除で変化するため）
  await loadTags()
}

onMounted(loadTags)

// モード切替（guest⇔auth）時もタグとフィルタを安定化
watch(
  () => isGuest.value,
  async () => {
    selectedTags.value = []
    keyword.value = ''
    await refresh()
  }
)
</script>

<style scoped>
.dashboard {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.section {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.section__title {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
}

.search {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  outline: none;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  user-select: none;
}

.chip.active {
  background: #3399ff;
  border-color: #3399ff;
  color: #fff;
}

.chip--clear {
  background: transparent;
  border-style: dashed;
}
</style>
