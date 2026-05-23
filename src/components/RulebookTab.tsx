'use client'

import React, { useEffect, useState, useCallback } from 'react'

type RuleSection = { index: string; name: string }
type RuleSectionDetail = { index: string; name: string; desc: string }

export function RulebookTab() {
  const [sections, setSections] = useState<RuleSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null)
  const [detailCache, setDetailCache] = useState<Record<string, RuleSectionDetail>>({})
  const [detailLoading, setDetailLoading] = useState<string | null>(null)

  useEffect(() => {
    fetch('https://www.dnd5eapi.co/api/rule-sections')
      .then(r => r.json())
      .then((data: unknown) => {
        if (isListResponse(data)) setSections(data.results)
        else setError(true)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const fetchDetail = useCallback(async (index: string) => {
    if (detailCache[index]) return
    setDetailLoading(index)
    try {
      const res = await fetch(`https://www.dnd5eapi.co/api/rule-sections/${index}`)
      const data: unknown = await res.json()
      if (isRuleSectionDetail(data)) {
        setDetailCache(prev => ({ ...prev, [index]: data }))
      }
    } catch { /* leave detailLoading cleared below */ }
    setDetailLoading(null)
  }, [detailCache])

  const handleToggle = (index: string) => {
    if (expandedIndex === index) {
      setExpandedIndex(null)
    } else {
      setExpandedIndex(index)
      void fetchDetail(index)
    }
  }

  const filtered = sections.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-stone-500 text-sm">
        Loading rulebook…
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 text-stone-500 text-sm">
        <p>Could not load rulebook.</p>
        <p className="text-xs mt-1 text-stone-600">Check your internet connection.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search rules…"
        className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-600"
      />
      <p className="text-xs text-stone-500">{filtered.length} section{filtered.length !== 1 ? 's' : ''}</p>
      <div className="space-y-1">
        {filtered.map(section => {
          const detail = detailCache[section.index]
          const isExpanded = expandedIndex === section.index
          const isDetailLoading = detailLoading === section.index
          return (
            <div key={section.index} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
              <button
                onClick={() => handleToggle(section.index)}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-stone-800/50 transition-colors"
              >
                <span className="font-medium text-sm text-stone-100">{section.name}</span>
                <span className={`text-stone-500 text-xs transition-transform duration-200 inline-block shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-stone-800 pt-3">
                  {isDetailLoading && <p className="text-stone-500 text-sm">Loading…</p>}
                  {detail && (
                    <RuleSectionContent desc={detail.desc} />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RuleSectionContent({ desc }: { desc: string }) {
  const paragraphs = desc.split(/\n+/).filter(p => p.trim().length > 0)
  return (
    <div className="space-y-2">
      {paragraphs.map((para, i) => {
        if (para.startsWith('###')) {
          return <p key={i} className="text-amber-400 text-xs font-semibold uppercase tracking-wider mt-3">{para.replace(/^#+\s*/, '')}</p>
        }
        if (para.startsWith('##')) {
          return <p key={i} className="text-stone-200 text-sm font-semibold mt-3">{para.replace(/^#+\s*/, '')}</p>
        }
        if (para.startsWith('#')) {
          return <p key={i} className="text-stone-100 text-base font-bold mt-3">{para.replace(/^#+\s*/, '')}</p>
        }
        if (para.startsWith('|')) {
          return <p key={i} className="text-stone-400 text-xs font-mono leading-relaxed">{para}</p>
        }
        return <p key={i} className="text-stone-300 text-xs leading-relaxed">{para}</p>
      })}
    </div>
  )
}

function isListResponse(v: unknown): v is { results: RuleSection[] } {
  return (
    typeof v === 'object' && v !== null &&
    'results' in v && Array.isArray((v as Record<string, unknown>).results)
  )
}

function isRuleSectionDetail(v: unknown): v is RuleSectionDetail {
  return (
    typeof v === 'object' && v !== null &&
    'name' in v && 'desc' in v
  )
}
