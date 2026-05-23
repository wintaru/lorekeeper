'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { ALL_CLASSES, getApiClassIndex } from '@/data/spellSlots'

type SpellSummary = { index: string; name: string }

type SpellDetail = {
  name: string
  level: number
  school: { name: string }
  casting_time: string
  range: string
  components: string[]
  material?: string
  duration: string
  concentration: boolean
  ritual: boolean
  desc: string[]
  higher_level?: string[]
  classes: { name: string }[]
}

const LEVEL_LABELS: Record<number, string> = {
  0: 'Cantrip',
  1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th',
  6: '6th', 7: '7th', 8: '8th', 9: '9th',
}

const LEVEL_COLORS: Record<number, string> = {
  0: 'bg-stone-700 text-stone-300',
  1: 'bg-sky-900/60 text-sky-300',
  2: 'bg-emerald-900/60 text-emerald-300',
  3: 'bg-violet-900/60 text-violet-300',
  4: 'bg-amber-900/60 text-amber-300',
  5: 'bg-red-900/60 text-red-300',
  6: 'bg-orange-900/60 text-orange-300',
  7: 'bg-pink-900/60 text-pink-300',
  8: 'bg-cyan-900/60 text-cyan-300',
  9: 'bg-rose-900/60 text-rose-300',
}

export function SpellsTab({ defaultClass }: { defaultClass?: string }) {
  const [allSpells, setAllSpells] = useState<SpellSummary[]>([])
  const [loadingAll, setLoadingAll] = useState(true)
  const [error, setError] = useState(false)

  // Class filter
  const [classFilter, setClassFilter] = useState<string>(() => {
    if (!defaultClass) return ''
    return getApiClassIndex(defaultClass) ?? ''
  })
  const [classSpellCache, setClassSpellCache] = useState<Record<string, SpellSummary[]>>({})
  const [loadingClass, setLoadingClass] = useState(false)

  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | ''>('')
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null)
  const [detailCache, setDetailCache] = useState<Record<string, SpellDetail>>({})
  const [detailLoading, setDetailLoading] = useState<string | null>(null)

  // Load full spell list once
  useEffect(() => {
    fetch('https://www.dnd5eapi.co/api/spells')
      .then(r => r.json())
      .then((data: unknown) => {
        if (isSpellListResponse(data)) setAllSpells(data.results)
        else setError(true)
      })
      .catch(() => setError(true))
      .finally(() => setLoadingAll(false))
  }, [])

  // Load class spell list when classFilter changes
  useEffect(() => {
    if (!classFilter) return
    if (classSpellCache[classFilter]) return
    setLoadingClass(true)
    fetch(`https://www.dnd5eapi.co/api/classes/${classFilter}/spells`)
      .then(r => r.json())
      .then((data: unknown) => {
        if (isSpellListResponse(data)) {
          setClassSpellCache(prev => ({ ...prev, [classFilter]: data.results }))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingClass(false))
  }, [classFilter, classSpellCache])

  const fetchDetail = useCallback(async (index: string) => {
    if (detailCache[index]) return
    setDetailLoading(index)
    try {
      const res = await fetch(`https://www.dnd5eapi.co/api/spells/${index}`)
      const data: unknown = await res.json()
      if (isSpellDetail(data)) setDetailCache(prev => ({ ...prev, [index]: data }))
    } catch { /* silently ignore */ }
    setDetailLoading(null)
  }, [detailCache])

  const handleToggle = (index: string) => {
    const next = expandedIndex === index ? null : index
    setExpandedIndex(next)
    if (next) void fetchDetail(next)
  }

  const baseList = classFilter
    ? (classSpellCache[classFilter] ?? allSpells)
    : allSpells

  const filtered = baseList.filter(s => {
    if (!s.name.toLowerCase().includes(search.toLowerCase())) return false
    if (levelFilter !== '') {
      const detail = detailCache[s.index]
      if (detail && detail.level !== levelFilter) return false
    }
    return true
  })

  const loading = loadingAll || (classFilter !== '' && loadingClass && !classSpellCache[classFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-stone-500 text-sm">
        Loading spells…
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 text-stone-500 text-sm">
        <p>Could not load spells.</p>
        <p className="text-xs mt-1 text-stone-600">Check your internet connection.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search spells…"
        className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm placeholder-stone-600 focus:outline-none focus:border-amber-600"
      />

      {/* Filters row */}
      <div className="flex gap-2">
        <select
          value={classFilter}
          onChange={e => { setClassFilter(e.target.value); setExpandedIndex(null) }}
          className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-300 focus:outline-none focus:border-amber-600"
        >
          <option value="">All Classes</option>
          {ALL_CLASSES.map(c => {
            const idx = getApiClassIndex(c)
            return idx ? <option key={idx} value={idx}>{c}</option> : null
          })}
        </select>

        <select
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value === '' ? '' : Number(e.target.value))}
          className="bg-stone-900 border border-stone-700 rounded-lg px-2 py-2 text-sm text-stone-300 focus:outline-none focus:border-amber-600"
        >
          <option value="">All Levels</option>
          <option value={0}>Cantrip</option>
          {[1,2,3,4,5,6,7,8,9].map(l => (
            <option key={l} value={l}>{l === 1 ? '1st' : l === 2 ? '2nd' : l === 3 ? '3rd' : `${l}th`}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-stone-500">
        {filtered.length} spell{filtered.length !== 1 ? 's' : ''}
        {classFilter && ` · ${classFilter.charAt(0).toUpperCase() + classFilter.slice(1)}`}
        {levelFilter !== '' && ` · ${LEVEL_LABELS[levelFilter as number] ?? levelFilter}`}
      </p>

      <div className="space-y-1">
        {filtered.map(spell => {
          const detail = detailCache[spell.index]
          const isExpanded = expandedIndex === spell.index
          const isDetailLoading = detailLoading === spell.index
          return (
            <div key={spell.index} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
              <button
                onClick={() => handleToggle(spell.index)}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-stone-800/50 transition-colors"
              >
                <span className="font-medium text-sm text-stone-100">{spell.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {detail && (
                    <>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${LEVEL_COLORS[detail.level] ?? LEVEL_COLORS[9]}`}>
                        {LEVEL_LABELS[detail.level] ?? `${detail.level}th`}
                      </span>
                      <span className="text-xs text-stone-500 hidden sm:inline">{detail.school.name}</span>
                    </>
                  )}
                  <span className={`text-stone-500 text-xs transition-transform duration-200 inline-block ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-stone-800 pt-3">
                  {isDetailLoading && <p className="text-stone-500 text-sm">Loading…</p>}
                  {detail && <SpellDetailView spell={detail} />}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SpellDetailView({ spell }: { spell: SpellDetail }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[spell.level] ?? LEVEL_COLORS[9]}`}>
          {LEVEL_LABELS[spell.level] ?? `${spell.level}th`} · {spell.school.name}
        </span>
        {spell.concentration && (
          <span className="text-xs bg-blue-950/60 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded-full">Concentration</span>
        )}
        {spell.ritual && (
          <span className="text-xs bg-teal-950/60 text-teal-400 border border-teal-900/50 px-2 py-0.5 rounded-full">Ritual</span>
        )}
        {spell.classes.length > 0 && (
          <span className="text-xs bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full">
            {spell.classes.map(c => c.name).join(', ')}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs bg-stone-800/40 rounded-lg p-3">
        <div>
          <p className="text-stone-500 uppercase tracking-wider text-[10px] mb-0.5">Casting Time</p>
          <p className="text-stone-200">{spell.casting_time}</p>
        </div>
        <div>
          <p className="text-stone-500 uppercase tracking-wider text-[10px] mb-0.5">Range</p>
          <p className="text-stone-200">{spell.range}</p>
        </div>
        <div>
          <p className="text-stone-500 uppercase tracking-wider text-[10px] mb-0.5">Duration</p>
          <p className="text-stone-200">{spell.duration}</p>
        </div>
        <div>
          <p className="text-stone-500 uppercase tracking-wider text-[10px] mb-0.5">Components</p>
          <p className="text-stone-200">
            {spell.components.join(', ')}
            {spell.material ? ` (${spell.material})` : ''}
          </p>
        </div>
      </div>
      <div className="space-y-1.5">
        {spell.desc.map((para, i) => (
          <p key={i} className="text-stone-300 text-xs leading-relaxed">{para}</p>
        ))}
      </div>
      {spell.higher_level && spell.higher_level.length > 0 && (
        <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3">
          <p className="text-xs text-amber-400 font-medium mb-1.5">At Higher Levels</p>
          {spell.higher_level.map((para, i) => (
            <p key={i} className="text-stone-300 text-xs leading-relaxed">{para}</p>
          ))}
        </div>
      )}
    </div>
  )
}

function isSpellListResponse(v: unknown): v is { results: SpellSummary[] } {
  return (
    typeof v === 'object' && v !== null &&
    'results' in v && Array.isArray((v as Record<string, unknown>).results)
  )
}

function isSpellDetail(v: unknown): v is SpellDetail {
  return (
    typeof v === 'object' && v !== null &&
    'name' in v && 'level' in v && 'school' in v &&
    'casting_time' in v && 'desc' in v
  )
}
