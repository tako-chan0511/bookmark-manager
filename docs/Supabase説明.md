# Supabase クライアントの主要エンドポイント

Supabase クライアント（createClient が返すオブジェクト）には、大きく分けて４つの主要エンドポイントがあります。それぞれの代表的なメソッドをまとめます。

## 1. Database（Postgres）操作：`supabase.from(テーブル名)`

- `.select(columns?)`
  - レコード取得
- `.insert(values, opts?)`
  - レコード挿入
- `.update(values)`
  - レコード更新（`.eq()` などで条件指定）
- `.delete()`
  - レコード削除（同上）

### クエリ条件ビルダー

- `.eq(column, value)`
- `.neq(column, value)`
- `.gt(column, value)` / `.lt(…)` / `.gte(…)` / `.lte(…)`
- `.like(column, pattern)` / `.ilike(…)`
- `.in(column, array)` / `.contains(…)` / `.overlaps(…)`
- `.order(column, { ascending: boolean })`
- `.limit(n)` / `.offset(n)`

### 複数テーブルのリレーション読み込み

- `.select(*, related_table(column1, column2))`

## 2. 認証（Auth）：`supabase.auth`

- `.signUp({ email, password })`
  - メール／パスワード登録
- `.signInWithPassword({ email, password })`
  - メール／パスワードログイン
- `.signOut()`
  - ログアウト
- `.session()` / `.getSession()`
  - 現在のセッション取得
- `.onAuthStateChange(callback)`
  - 認証状態変更のリアルタイム監視
- `.resetPasswordForEmail(email)` / `.updateUser({ data })` など

## 3. ストレージ（Storage）：`supabase.storage.from(バケット名)`

- `.upload(path, file, opts?)`
  - ファイルアップロード
- `.download(path)`
  - ファイルダウンロード
- `.list(path, opts?)`
  - バケット内ファイル一覧
- `.remove([paths])`
  - ファイル削除
- `.createSignedUrl(path, expiresIn)`
  - 署名付き URL 発行

## 4. Edge Functions（Functions）：`supabase.functions`

- `.invoke(functionName, { body?, headers? })`
  - サーバーレス関数呼び出し

## 5. リアルタイム（Realtime）：`supabase.channel(チャネル名)`

- `.on(event, { schema, table, filter? }, handler)`
  - テーブル更新監視
- `.subscribe()` / `.unsubscribe()`

## 6. その他ユーティリティ

- `.rpc(fnName, params)`
  - Postgres の RPC（ストアドプロシージャ）呼び出し
- `.removeAllSubscriptions()`
  - 全チャネル購読解除
- `.getUrl()` / `.revokeSignedUrl()` （Storage 関連）

---

⚠️ メソッド名やシグネチャは supabase-js のバージョンによって若干変わることがあります。詳しくは公式リファレンスをご参照ください。  
[Supabase JS リファレンス](https://supabase.com/docs/reference/javascript/introduction)

これらを組み合わせて、CRUD 操作から認証、ファイル管理、リアルタイム監視までを一気通貫で行えます！もし特定のメソッドの使い方サンプルが必要な場合は、お気軽にご質問ください。