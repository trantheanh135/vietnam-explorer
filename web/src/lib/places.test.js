import { describe, expect, it } from 'vitest'
import SEED from '../data/seed.json'
import { areaCounts, directionsUrl, distanceKm, filterPlaces, formatDistance, googleMapsUrl, nearby, normalize } from './places'
import { setReview } from './reviews'

describe('normalize', () => {
  it('removes Vietnamese diacritics and đ', () => {
    expect(normalize('Phở Đà Lạt')).toBe('pho da lat')
    expect(normalize('  Bún Chả ')).toBe('bun cha')
  })
})

describe('filterPlaces', () => {
  it('finds places without typing accents', () => {
    expect(filterPlaces(SEED, { category: 'travel', query: 'da lat' }).map((p) => p.id)).toContain('da-lat')
  })
  it('matches every word of the query', () => {
    expect(filterPlaces(SEED, { category: 'food', query: 'pho ha noi' }).map((p) => p.id)).toEqual(['pho-thin'])
  })
  it('filters by category, region and tag', () => {
    const r = filterPlaces(SEED, { category: 'travel', region: 'south', tag: 'beach' })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((p) => p.category === 'travel' && p.region === 'south' && p.tags.includes('beach'))).toBe(true)
  })
})

describe('seed data', () => {
  it('has 28 travel places and 28 food reviews with unique ids', () => {
    expect(SEED.filter((p) => p.category === 'travel')).toHaveLength(28)
    expect(SEED.filter((p) => p.category === 'food')).toHaveLength(28)
    expect(new Set(SEED.map((p) => p.id)).size).toBe(SEED.length)
  })
  it('keeps every pin inside Vietnam and has both languages', () => {
    for (const p of SEED) {
      expect(p.lat > 8 && p.lat < 23.5 && p.lng > 102 && p.lng < 110, p.id).toBe(true)
      expect(p.descEn.length > 20 && p.descVi.length > 20, p.id).toBe(true)
      expect(['north', 'central', 'south']).toContain(p.region)
    }
  })
  it('food has a venue and a 1–5 rating; photos are https with credit', () => {
    for (const p of SEED.filter((x) => x.category === 'food')) {
      expect(p.venue, p.id).toBeTruthy()
      expect(p.rating >= 1 && p.rating <= 5, p.id).toBe(true)
    }
    for (const p of SEED.filter((x) => x.image)) {
      expect(p.image.src, p.id).toMatch(/^https:\/\/(upload|thumb)\.wikimedia\.org\//)
      expect(p.image.license, p.id).toBeTruthy()
    }
  })
})

describe('Google Maps links', () => {
  it('searches food by venue and address, travel by name and province', () => {
    const pho = SEED.find((p) => p.id === 'pho-thin')
    expect(decodeURIComponent(googleMapsUrl(pho))).toContain('Phở Thìn Lò Đúc, 13 Lò Đúc')
    expect(directionsUrl(pho)).toMatch(/\/maps\/dir\/\?api=1&destination=/)
    const halong = SEED.find((p) => p.id === 'ha-long-bay')
    expect(decodeURIComponent(googleMapsUrl(halong))).toContain('Vịnh Hạ Long, Quảng Ninh')
  })
})

describe('areas and distances', () => {
  it('counts areas, biggest first, and filters by area', () => {
    const counts = areaCounts(SEED.filter((p) => p.category === 'food'))
    expect(counts[0][1]).toBeGreaterThanOrEqual(counts[1][1])
    const [area] = counts[0]
    expect(filterPlaces(SEED, { category: 'food', area }).every((p) => p.area === area)).toBe(true)
  })
  it('measures distance and lists the closest places first', () => {
    // Hoàn Kiếm Lake to the Cathedral: about 0.5 km.
    expect(distanceKm({ lat: 21.0287, lng: 105.8523 }, { lat: 21.0287, lng: 105.8489 })).toBeCloseTo(0.35, 1)
    const pho = SEED.find((p) => p.id === 'pho-thin')
    const near = nearby(SEED, pho, { maxKm: 3 })
    expect(near.every((x, i) => i === 0 || near[i - 1].km <= x.km)).toBe(true)
    expect(near.some((x) => x.place.id === 'pho-thin')).toBe(false)
  })
  it('formats distances per language', () => {
    expect(formatDistance(0.347, 'vi')).toBe('350 m')
    expect(formatDistance(1.24, 'vi')).toBe('1,2 km')
    expect(formatDistance(1.24, 'en')).toBe('1.2 km')
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

describe('journeyOrder', () => {
  it('goes north → central → south and hops to the nearest next place', async () => {
    const { journeyOrder } = await import('../components/Journey.jsx')
    const travel = SEED.filter((p) => p.category === 'travel')
    const order = journeyOrder(travel)
    expect(order).toHaveLength(travel.length)
    const rank = { north: 0, central: 1, south: 2 }
    expect(order.every((p, i) => i === 0 || rank[order[i - 1].region] <= rank[p.region])).toBe(true)
    const firstNorth = order[0]
    expect(travel.filter((p) => p.region === 'north').every((p) => p.lat <= firstNorth.lat)).toBe(true)
  })
})
