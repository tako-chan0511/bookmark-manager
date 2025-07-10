# src/router/index.ts の処理について

src/router/index.ts は、Vue 3 + Vue Router を使ってアプリのページ遷移と認証チェックを行う設定ファイルです。順を追って解説します。

## インポート

```ts
// Vue Router の生成に必要な関数をインポート
import { createRouter, createWebHistory } from 'vue-router'
// 各ページコンポーネント
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
// 認証状況を取得するための Supabase クライアント
import { supabase } from '@/supabase/supabase'
```

## ルート定義（routes 配列）

- `path`: URL のパス
- `name`: ルート名（router.push({ name: '〜' }) で使う）
- `component`: そのパスに対応する Vue コンポーネント
- `meta.requiresAuth`: このルートはログイン必須、というフラグを追加

```ts
const routes = [
  { path: '/',       name: 'Home',      component: Home },
  { path: '/login',  name: 'Login',     component: Login },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }   // ← ログインしていないと入れない
  }
]
```

## ルーターインスタンスの生成

createWebHistory() を使うことで「きれいな URL」（ハッシュ # なし）になります。

```ts
const router = createRouter({
  history: createWebHistory(),
  routes
})
```

## グローバルナビゲーションガード

画面遷移のたびに呼ばれ、認証状態をチェックします。

```ts
router.beforeEach(async (to, from, next) => {
  // Supabase Auth から現在のセッション（ログイン状態）を取得
  const { data: { session } } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && !session) {
    // → 「requiresAuth: true」かつ未ログインなら Login へリダイレクト
    next({ name: 'Login' })
  } else if ((to.name === 'Login' || to.name === 'Home') && session) {
    // → ログイン or Home ページに来たが、すでにログイン済みなら
    //    ダッシュボードに飛ばす（ログイン画面をスキップ）
    next({ name: 'Dashboard' })
  } else {
    // それ以外はそのまま許可
    next()
  }
})
```

## エクスポート

他の箇所（main.ts）で router をインポートして Vue アプリに組み込みます。

```ts
export default router
```

## まとめ

- **ルート定義** でどの URL にどのコンポーネントを割り当てるかを決める。
- **meta.requiresAuth** を使ってログイン必須ルートをマーク。
- **beforeEach ガード** で毎回セッションをチェックし、未ログインなら強制的にログインページへ、逆に「ログイン済みが行くべきでないページ（Login/Home）」には強制リダイレクト。
- この仕組みにより、認証状態に応じた安全なページ遷移が実現できます。何かご不明点があればお気軽にどうぞ！