<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase'; // Supabaseクライアントをインポート

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref<string | null>(null);

// 認証状態を管理するためのref
const user = ref<any>(null); // SupabaseのUserオブジェクトを格納
const session = ref<any>(null); // SupabaseのSessionオブジェクトを格納

// 認証状態の監視
onMounted(() => {
  // 初期ロード時のセッション取得
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session;
    user.value = data.session?.user;
  });

  // 認証状態の変化をリアルタイムで監視
  supabase.auth.onAuthStateChange((event, newSession) => {
    session.value = newSession;
    user.value = newSession?.user;
    if (event === 'SIGNED_OUT') {
      console.log('User signed out.');
    } else if (event === 'SIGNED_IN') {
      console.log('User signed in.');
    }
  });
});

// サインアップ処理
const handleSignUp = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    });
    if (signUpError) throw signUpError;
    alert('登録が完了しました！メールアドレスを確認してください。');
    console.log('Sign up successful:', data);
  } catch (err: any) {
    error.value = err.message || '登録に失敗しました。';
    console.error('Sign up error:', err);
  } finally {
    loading.value = false;
  }
};

// ログイン処理
const handleSignIn = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (signInError) throw signInError;
    alert('ログインしました！');
    console.log('Sign in successful:', data);
  } catch (err: any) {
    error.value = err.message || 'ログインに失敗しました。';
    console.error('Sign in error:', err);
  } finally {
    loading.value = false;
  }
};

// ログアウト処理
const handleSignOut = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
    alert('ログアウトしました。');
    console.log('Signed out.');
  } catch (err: any) {
    error.value = err.message || 'ログアウトに失敗しました。';
    console.error('Sign out error:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <div v-if="session">
      <h2>ログイン済み</h2>
      <p>ようこそ、{{ user?.email }}さん！</p>
      <button @click="handleSignOut" :disabled="loading">ログアウト</button>
    </div>
    <div v-else>
      <h2>ログイン / 登録</h2>
      <form @submit.prevent="handleSignIn">
        <div class="form-group">
          <label for="email">メールアドレス:</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">パスワード:</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="loading">ログイン</button>
          <button type="button" @click="handleSignUp" :disabled="loading">登録</button>
        </div>
      </form>
      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  text-align: center;
}

h2 {
  color: #333;
  margin-bottom: 25px;
  font-size: 1.8em;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
}

.form-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 25px;
}

.form-actions button {
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  font-weight: bold;
  transition: background-color 0.3s ease;
  color: white;
}

.form-actions button[type="submit"] {
  background-color: #007bff; /* Primary Blue */
}

.form-actions button[type="submit"]:hover:not(:disabled) {
  background-color: #0056b3;
}

.form-actions button[type="button"] {
  background-color: #28a745; /* Success Green */
}

.form-actions button[type="button"]:hover:not(:disabled) {
  background-color: #218838;
}

.form-actions button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  color: #dc3545; /* Danger Red */
  margin-top: 15px;
  font-weight: bold;
}
</style>