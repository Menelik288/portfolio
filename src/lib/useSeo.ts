import { useEffect } from 'react'
import { site } from '../data/content'

export function useSeo(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${site.name}` : `${site.name} — ${site.role}`
    const set = (sel: string, v: string) => document.querySelector(sel)?.setAttribute('content', v)
    const d = description ?? site.description
    set('meta[name="description"]', d)
    set('meta[property="og:title"]', document.title)
    set('meta[property="og:description"]', d)
  }, [title, description])
}
