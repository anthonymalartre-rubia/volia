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
  })

  afterAll(() => {
    process.env = originalEnv
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
