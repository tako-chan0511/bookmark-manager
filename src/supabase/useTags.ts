// src/supabase/useTags.ts
import { ref, onMounted } from 'vue'
import { supabase } from './supabase'

export function useTags() {
  const tags = ref<{ id: string; name: string }[]>([])
  const load = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('id,name')
      .order('name')
    if (!error && data) tags.value = data
  }
  onMounted(load)
  return { tags, reload: load }
}
