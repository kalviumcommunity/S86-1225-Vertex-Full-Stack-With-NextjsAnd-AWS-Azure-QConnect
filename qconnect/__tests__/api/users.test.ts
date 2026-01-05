jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('../../src/lib/redis', () => ({
  default: {
    get: jest.fn(),
    set: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
  },
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    keys: jest.fn(),
    del: jest.fn(),
  },
}));

import { GET } from '../../app/api/users/route';
import { prisma } from '../../src/lib/prisma';
import redisModule from '../../src/lib/redis';

afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});

test('GET /api/users returns users and sets cache when missing', async () => {
  // Arrange: mock redis to miss
  (redisModule.redis.get as jest.Mock).mockResolvedValue(null);

  // Arrange: mock prisma
  const mockUsers = [
    { id: 1, name: 'Alice', email: 'alice@example.com', phone: null, role: 'user', createdAt: new Date().toISOString() },
    { id: 2, name: 'Bob', email: 'bob@example.com', phone: null, role: 'user', createdAt: new Date().toISOString() },
  ];
  (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
  (prisma.user.count as jest.Mock).mockResolvedValue(2);

  const req = new Request('http://localhost/api/users?page=1&limit=2', {
    method: 'GET',
    headers: { 'x-user-email': 'admin@example.com' },
  });

  const res = await GET(req as unknown as Request);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.data.data).toHaveLength(2);
  expect(body.data.meta.accessedBy).toBe('admin@example.com');
  // Cache set called with stringified payload
  expect(redisModule.redis.set).toHaveBeenCalled();
});

test('GET /api/users returns unauthorized when header missing', async () => {
  const req = new Request('http://localhost/api/users', { method: 'GET' });
  const res = await GET(req as unknown as Request);
  expect(res.status).toBe(401);
  const body = await res.json();
  expect(body.success).toBe(false);
});
