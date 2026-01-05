const target = process.env.TARGET_URL || process.env.DEPLOY_URL || 'http://localhost:3000';

describe('Smoke: /api/health', () => {
  test('health endpoint returns ok', async () => {
    const res = await fetch(`${target}/api/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(typeof body.uptime).toBe('number');
  }, 10000);
});
