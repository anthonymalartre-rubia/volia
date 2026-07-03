// Mock the Anthropic SDK before importing the route
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ text: '["restaurant italien", "pizzeria"]' }],
      }),
    },
  }))
})

// La route exige désormais une auth + un check de quota AVANT la validation de
// requête (durcissement P0 : la route était anonyme et brûlait le crédit
// Anthropic). Les tests doivent donc mocker auth + usage, sinon getAuthenticatedUser
// lève et tout tombe en 500 (c'est ce qui rendait la suite rouge — audit H2).
let mockUser = { id: 'test-user' }
jest.mock('@/lib/auth', () => ({
  getAuthenticatedUser: jest.fn(async () => ({ user: mockUser, supabase: {} })),
}))
let mockLimit = { allowed: true, remaining: 100 }
jest.mock('@/lib/usage', () => ({
  checkLimit: jest.fn(async () => mockLimit),
}))
jest.mock('@/lib/apiCosts', () => ({ trackApiCall: jest.fn() }))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data, opts) => ({
      json: async () => data,
      status: opts?.status || 200,
      _data: data,
      _status: opts?.status || 200,
    }),
  },
}))

import { POST } from '../route'

describe('POST /api/parse-search', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'test-key' }
    mockUser = { id: 'test-user' }
    mockLimit = { allowed: true, remaining: 100 }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  test('returns 401 when not authenticated', async () => {
    mockUser = null
    const request = { json: async () => ({ query: 'restaurants italiens' }) }
    const response = await POST(request)
    expect(response._status).toBe(401)
  })

  test('returns 429 when search quota exhausted', async () => {
    mockLimit = { allowed: false, remaining: 0 }
    const request = { json: async () => ({ query: 'restaurants italiens' }) }
    const response = await POST(request)
    expect(response._status).toBe(429)
  })

  test('returns 400 for empty query', async () => {
    const request = {
      json: async () => ({ query: '' }),
    }
    const response = await POST(request)
    expect(response._status).toBe(400)
  })

  test('returns 400 for too-short query', async () => {
    const request = {
      json: async () => ({ query: 'ab' }),
    }
    const response = await POST(request)
    expect(response._status).toBe(400)
  })

  test('returns terms array for valid query', async () => {
    const request = {
      json: async () => ({ query: 'restaurants italiens à Paris' }),
    }
    const response = await POST(request)
    expect(response._status).toBe(200)
    const data = response._data
    expect(data.terms).toBeDefined()
    expect(Array.isArray(data.terms)).toBe(true)
    expect(data.terms.length).toBeGreaterThan(0)
  })
})
