// src/session/appMode.ts
import { ref, computed } from 'vue'

export type AppMode = 'auth' | 'guest'
export const APP_MODE_KEY = 'app_mode'

// 互換：昔のキーが残っていたら guest 扱いに寄せる（任意）
function readInitialMode(): AppMode {
  if (typeof window === 'undefined') return 'auth'
  const v = window.localStorage.getItem(APP_MODE_KEY)
  if (v === 'guest') return 'guest'

  // 互換（あなたの現状コードに 'sandbox' が混ざっていたため）
  const legacySandbox =
    window.localStorage.getItem('sandbox') === 'true' ||
    window.localStorage.getItem('sandbox_mode') === 'true'
  if (legacySandbox) {
    window.localStorage.setItem(APP_MODE_KEY, 'guest')
    window.localStorage.removeItem('sandbox')
    window.localStorage.removeItem('sandbox_mode')
    return 'guest'
  }
  return 'auth'
}

const mode = ref<AppMode>(readInitialMode())

function persist(m: AppMode) {
  mode.value = m
  if (typeof window === 'undefined') return
  if (m === 'guest') window.localStorage.setItem(APP_MODE_KEY, 'guest')
  else window.localStorage.removeItem(APP_MODE_KEY)
}

export function enterGuest() {
  persist('guest')
}
export function exitGuest() {
  persist('auth')
}

export function useAppMode() {
  const isGuest = computed(() => mode.value === 'guest')
  return { mode, isGuest, enterGuest, exitGuest }
}

// router など（Vue外）から参照したい用
export function getAppModeRef() {
  return mode
}

// 別タブ操作も同期（任意）
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== APP_MODE_KEY) return
    mode.value = e.newValue === 'guest' ? 'guest' : 'auth'
  })
}
