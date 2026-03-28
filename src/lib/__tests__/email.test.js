import { sendEmail } from '../email'

// Mock global fetch
global.fetch = jest.fn()

describe('sendEmail', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetAllMocks()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  test('returns error when RESEND_API_KEY is not set', async () => {
    delete process.env.RESEND_API_KEY
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hello</p>',
    })
    expect(result.success).toBe(false)
    expect(result.error).toContain('RESEND_API_KEY')
    expect(fetch).not.toHaveBeenCalled()
  })

  test('calls Resend API with correct payload', async () => {
    process.env.RESEND_API_KEY = 're_live_fake123'
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'email-id-123' }),
    })

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Bienvenue',
      html: '<h1>Bienvenue</h1>',
    })

    expect(result.success).toBe(true)
    expect(result.id).toBe('email-id-123')
    expect(fetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer re_live_fake123',
        }),
      })
    )
  })

  test('uses fallback sender for test API keys', async () => {
    process.env.RESEND_API_KEY = 're_test_fake456'
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'test-id' }),
    })

    await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
    })

    const callBody = JSON.parse(fetch.mock.calls[0][1].body)
    expect(callBody.from).toContain('resend.dev')
  })

  test('returns error on API failure', async () => {
    process.env.RESEND_API_KEY = 're_live_fake123'
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid API key' }),
    })

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Invalid API key')
  })
})
