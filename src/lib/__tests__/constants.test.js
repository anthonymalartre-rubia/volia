import { DEPTS, REGIONS, B2B_CATS, COPRO_CATS, B2B_GROUPS, COPRO_GROUPS } from '../constants'

describe('DEPTS', () => {
  const deptEntries = Object.entries(DEPTS)

  test('has 101 entries', () => {
    expect(deptEntries.length).toBe(101)
  })

  test('each department has name, lat, lng, r', () => {
    for (const [code, dept] of deptEntries) {
      expect(dept).toHaveProperty('name')
      expect(typeof dept.name).toBe('string')
      expect(dept).toHaveProperty('lat')
      expect(typeof dept.lat).toBe('number')
      expect(dept).toHaveProperty('lng')
      expect(typeof dept.lng).toBe('number')
      expect(dept).toHaveProperty('r')
      expect(typeof dept.r).toBe('number')
    }
  })
})

describe('REGIONS', () => {
  test('covers all departments', () => {
    const allDeptCodes = Object.keys(DEPTS)
    const regionDeptCodes = Object.values(REGIONS).flatMap(r => r.depts)

    // Every department should appear in exactly one region
    for (const code of allDeptCodes) {
      expect(regionDeptCodes).toContain(code)
    }

    // Every region dept code should exist in DEPTS
    for (const code of regionDeptCodes) {
      expect(allDeptCodes).toContain(code)
    }
  })

  test('has 14 regions', () => {
    expect(Object.keys(REGIONS).length).toBe(14)
  })
})

describe('B2B_CATS', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(B2B_CATS)).toBe(true)
    expect(B2B_CATS.length).toBeGreaterThan(0)
  })

  test('B2B_GROUPS values flatten to B2B_CATS', () => {
    const flattened = Object.values(B2B_GROUPS).flat()
    expect(flattened).toEqual(B2B_CATS)
  })
})

describe('COPRO_CATS', () => {
  test('is a non-empty array', () => {
    expect(Array.isArray(COPRO_CATS)).toBe(true)
    expect(COPRO_CATS.length).toBeGreaterThan(0)
  })

  test('COPRO_GROUPS values flatten to COPRO_CATS', () => {
    const flattened = Object.values(COPRO_GROUPS).flat()
    expect(flattened).toEqual(COPRO_CATS)
  })
})
