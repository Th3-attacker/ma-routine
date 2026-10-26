import type { Remote, RemoteRow } from './engine'
import { supabase } from './supabase'

const PAGE = 1000

/** Le serveur Supabase vu par le moteur de synchro. Les règles RLS limitent tout au compte connecté. */
export const supabaseRemote: Remote = {
  async pull(table, since) {
    if (!supabase) return []
    const out: RemoteRow[] = []
    for (let from = 0; ; from += PAGE) {
      let q = supabase
        .from(table)
        .select('id,data,updated_at,deleted,synced_at')
        .order('synced_at')
        .range(from, from + PAGE - 1)
      if (since) q = q.gt('synced_at', since)
      const { data, error } = await q
      if (error) throw error
      out.push(...((data ?? []) as RemoteRow[]))
      if (!data || data.length < PAGE) break
    }
    return out
  },
  async push(table, rows) {
    if (!supabase) return
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from(table).upsert(rows.slice(i, i + 500), { onConflict: 'user_id,id' })
      if (error) throw error
    }
  },
}
