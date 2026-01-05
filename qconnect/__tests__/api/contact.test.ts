jest.mock('../src/lib/email', () => ({
  sendEmail: jest.fn(),
}));

import { POST } from '../src/app/api/contact/route';
import { sendEmail } from '../src/lib/email';

afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

test('POST /api/contact returns 200 and calls sendEmail', async () => {
  const payload = { name: 'Alice', email: 'alice@example.com', message: 'Hello there' };
  const req = new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const res = await POST(req as unknown as Request);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.message).toMatch(/Message received/i);
  expect(sendEmail).toHaveBeenCalled();
});

test('POST /api/contact returns error for invalid payload', async () => {
  const payload = { name: 'A', email: 'not-an-email', message: 'hi' };
  const req = new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const res = await POST(req as unknown as Request);
  expect(res.status).toBeGreaterThanOrEqual(400);
  const body = await res.json();
  expect(body.success).toBe(false);
});
