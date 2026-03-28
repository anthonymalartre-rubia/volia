import { checkRateLimit, getRateLimitStatus } from '../rateLimit'

describe('checkRateLimit', () => {
  test('requests within limit succeed', () => {
    const id = 'test-within-limit-' + Date.now()
    const result1 = checkRateLimit(id, 3, 60000)
    expect(result1.success).toBe(true)
    expect(result1.remaining).toBe(2)

    const result2 = checkRateLimit(id, 3, 60000)
    expect(result2.success).toBe(true)
    expect(result2.remaining).toBe(1)

    const result3 = checkRateLimit(id, 3, 60000)
    expect(result3.success).toBe(true)
    expect(result3.remaining).toBe(0)
  })

  test('requests exceeding limit fail', () => {
    const id = 'test-exceed-limit-' + Date.now()
    // Use up all attempts
    checkRateLimit(id, 2, 60000)
    checkRateLimit(id, 2, 60000)

    const result = checkRateLimit(id, 2, 60000)
    expect(result.success).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.resetAt).toBeInstanceOf(Date)
  })

  test('different identifiers have separate limits', () => {
    const idA = 'test-separate-A-' + Date.now()
    const idB = 'test-separate-B-' + Date.now()

    // Exhaust limit for idA
    checkRateLimit(idA, 1, 60000)
    const resultA = checkRateLimit(idA, 1, 60000)
    expect(resultA.success).toBe(false)

    // idB should still succeed
    const resultB = checkRateLimit(idB, 1, 60000)
    expect(resultB.success).toBe(true)
  })
})

describe('getRateLimitStatus', () => {
  test('returns full remaining for unknown identifier', () => {
    const id = 'test-unknown-' + Date.now()
    const status = getRateLimitStatus(id, 5)
    expect(status.remaining).toBe(5)
    expect(status.resetAt).toBeNull()
  })

  test('returns correct remaining after some requests', () => {
    const id = 'test-status-' + Date.now()
    checkRateLimit(id, 5, 60000)
    checkRateLimit(id, 5, 60000)

    const status = getRateLimitStatus(id, 5)
    expect(status.remaining).toBe(3)
    expect(status.resetAt).toBeInstanceOf(Date)
  })
})
