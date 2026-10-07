import { describe, expect, it } from 'vitest'
import { FOOD } from '../data/food'
import { TRAVEL } from '../data/travel'
import { directionsUrl, filterPlaces, googleMapsUrl, normalize } from './places'
import { setReview } from './reviews'

describe('normalize', () => {
  it('removes Vietnamese diacritics and đ', () => {
    expect(normalize('Phở Đà Lạt')).toBe('pho da lat')
    expect(normalize('  Bún Chả ')).toBe('bun cha')
  })
})

describe('filterPlaces', () => {
  it('finds places without typing accents', () => {
    const r = filterPlaces(TRAVEL, { query: 'da lat' })
    expect(r.map((p) => p.id)).toContain('da-lat')
  })
  it('matches every word of the query', () => {
    const r = filterPlaces(FOOD, { query: 'pho ha noi' })
    expect(r.map((p) => p.id)).toEqual(['pho-thin'])
  })
  it('filters by region and tag', () => {
    const r = filterPlaces(TRAVEL, { region: 'south', tag: 'beach' })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((p) => p.region === 'south' && p.tags.includes('beach'))).toBe(true)
  })
})

describe('data integrity', () => {
  const all = [...TRAVEL, ...FOOD]
  it('has unique ids', () => {
    expect(new Set(all.map((p) => p.id)).size).toBe(all.length)
  })
  it('keeps every pin inside Vietnam\'s bounding box', () => {
    for (const p of all) {
      expect(p.lat, p.id).toBeGreaterThan(8)
      expect(p.lat, p.id).toBeLessThan(23.5)
      expect(p.lng, p.id).toBeGreaterThan(102)
      expect(p.lng, p.id).toBeLessThan(110)
    }
  })
  it('has bilingual descriptions and a valid region', () => {
    for (const p of all) {
      expect(p.desc.en.length, p.id).toBeGreaterThan(20)
      expect(p.desc.vi.length, p.id).toBeGreaterThan(20)
      expect(['north', 'central', 'south']).toContain(p.region)
    }
  })
  it('food ratings are between 1 and 5', () => {
    for (const f of FOOD) expect(f.rating >= 1 && f.rating <= 5, f.id).toBe(true)
  })
})

describe('Google Maps links', () => {
  it('builds search and directions URLs', () => {
    const pho = FOOD.find((f) => f.id === 'pho-thin')
    expect(googleMapsUrl(pho)).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/)
    expect(decodeURIComponent(googleMapsUrl(pho))).toContain('13 Lò Đúc')
    expect(directionsUrl(pho)).toMatch(/\/maps\/dir\/\?api=1&destination=/)
  })
})

describe('setReview', () => {
  it('merges a patch without mutating the original', () => {
    const before = {}
    const after = setReview(before, 'hoi-an', { rating: 5 })
    expect(before).toEqual({})
    expect(after['hoi-an'].rating).toBe(5)
    expect(after['hoi-an'].favourite).toBe(false)
  })
})
