# 概要
　本番環境ではフロントエンド（Vercel）→バックエンド（Supabase）の通信しかなく、ブラウザ側で自前に CORS をさばいているのではなく、Supabase 側の「Allowed CORS origins」にデプロイ先のドメインを登録することで対応しています。

CORS 対応の流れ
Supabase ダッシュボードへアクセス
プロジェクトを選択し、左サイドバーから Settings → API を開きます。

Allowed CORS origins に本番ドメインを追加
https://your-app-name.vercel.app（またはカスタムドメイン）を追加すると、
Supabase サーバーがそのオリジンからのリクエストに対して
Access-Control-Allow-Origin: https://your-app-name.vercel.app を返すようになります。

フロントエンドは通常どおり supabase-js で fetch

ts
コピーする
編集する
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(URL, ANON_KEY)
// あとは supabase.from('…').select() などを呼び出すだけ
これでブラウザが自動的にプリフライトを飛ばし、Supabase が正しい CORS ヘッダーを返してくれます。

ローカル開発時の CORS
開発時は Vite のプロキシ機能（vite.config.ts の server.proxy）であらかじめ同一オリジンに見せかけているので、CORS エラーは出ません。

もし他の API（たとえば自前の Express や Netlify Functions）を使う場合
そのサーバー側に cors ミドルウェア（Express なら npm install cors）を入れて、


import cors from 'cors'
app.use(cors({ origin: ['https://your-app.vercel.app'] }))
のように許可オリジンを指定します。

まとめると、本番環境の CORS はすべて Supabase 側の設定（Allowed CORS origins）だけで完結しています。これを正しく設定しておけば、フロントエンド側に特別なコードを追加する必要はありません。