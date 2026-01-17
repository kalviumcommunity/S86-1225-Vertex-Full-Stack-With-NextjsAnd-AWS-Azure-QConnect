/**
 * Health Check Endpoint
 * 
 * This endpoint is used by deployment verification processes to ensure
 * the application is running and healthy. It's also used for monitoring,
 * load balancers, and Kubernetes probes.
 * 
 * HTTP 200 (OK) = Application is healthy
 * HTTP 503 (Service Unavailable) = Application is degraded or unhealthy
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

/**
 * Health check status levels
 */
export enum HealthStatus {
  OK = 'ok',
  DEGRADED = 'degraded',
  CRITICAL = 'critical',
}

/**
 * Health check response structure
 */
interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: {
      status: HealthStatus;
      responseTime?: number;
      error?: string;
    };
    redis: {
      status: HealthStatus;
      responseTime?: number;
      error?: string;
    };
    memory: {
      status: HealthStatus;
      usage: {
        heap: {
          used: number;
          total: number;
        };
      };
    };
  };
}

/**
 * GET /api/health
 * 
 * Performs comprehensive health checks and returns status.
 * Used by:
 * - Deployment verification in CI/CD pipeline
 * - Load balancers (for traffic decisions)
 * - Monitoring systems
 * - Kubernetes liveness/readiness probes
 * - Alerting systems
 */
export async function GET(req: NextRequest): Promise<NextResponse<HealthCheckResponse>> {
  const startTime = Date.now();

  try {
    // Initialize health response
    const healthResponse: HealthCheckResponse = {
      status: HealthStatus.OK,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      checks: {
        database: { status: HealthStatus.OK },
        redis: { status: HealthStatus.OK },
        memory: {
          status: HealthStatus.OK,
          usage: {
            heap: {
              used: 0,
              total: 0,
            },
          },
        },
      },
    };

    // Check database connectivity
    const dbStartTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthResponse.checks.database.responseTime = Date.now() - dbStartTime;
      healthResponse.checks.database.status = HealthStatus.OK;
    } catch (error: any) {
      healthResponse.checks.database.status = HealthStatus.CRITICAL;
      healthResponse.checks.database.error = error?.message || 'Database connection failed';
      healthResponse.status = HealthStatus.CRITICAL;
    }

    // Check Redis connectivity (if enabled)
    if (process.env.REDIS_URL) {
      const redisStartTime = Date.now();
      try {
        await redis.ping();
        healthResponse.checks.redis.responseTime = Date.now() - redisStartTime;
        healthResponse.checks.redis.status = HealthStatus.OK;
      } catch (error: any) {
        healthResponse.checks.redis.status = HealthStatus.DEGRADED;
        healthResponse.checks.redis.error = error?.message || 'Redis connection failed';
        // Don't set status to CRITICAL - Redis is optional
        if (healthResponse.status === HealthStatus.OK) {
          healthResponse.status = HealthStatus.DEGRADED;
        }
      }
    } else {
      healthResponse.checks.redis.status = HealthStatus.OK;
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    healthResponse.checks.memory.usage.heap.used = Math.round(memUsage.heapUsed / 1024 / 1024);
    healthResponse.checks.memory.usage.heap.total = Math.round(memUsage.heapTotal / 1024 / 1024);

    // Alert if memory usage is high (> 80% of heap)
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    if (heapUsagePercent > 90) {
      healthResponse.checks.memory.status = HealthStatus.CRITICAL;
      healthResponse.status = HealthStatus.CRITICAL;
    } else if (heapUsagePercent > 80) {
      healthResponse.checks.memory.status = HealthStatus.DEGRADED;
      if (healthResponse.status === HealthStatus.OK) {
        healthResponse.status = HealthStatus.DEGRADED;
      }
    }

    // Determine HTTP status code based on health status
    const httpStatus =
      healthResponse.status === HealthStatus.OK ? 200 : 
      healthResponse.status === HealthStatus.DEGRADED ? 200 : 
      503;

    // Add response time
    const responseTime = Date.now() - startTime;
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Response-Time': `${responseTime}ms`,
      'X-Health-Status': healthResponse.status,
    });

    return NextResponse.json(healthResponse, { 
      status: httpStatus,
      headers,
    });
  } catch (error: any) {
    // Catastrophic error
    const errorResponse: HealthCheckResponse = {
      status: HealthStatus.CRITICAL,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      checks: {
        database: { status: HealthStatus.CRITICAL, error: 'Health check failed' },
        redis: { status: HealthStatus.CRITICAL, error: 'Health check failed' },
        memory: {
          status: HealthStatus.CRITICAL,
          usage: { heap: { used: 0, total: 0 } },
        },
      },
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

/**
 * Health Check Usage Examples
 * 
 * # Simple curl test
 * curl http://localhost:3000/api/health
 * 
 * # With response headers
 * curl -i http://localhost:3000/api/health
 * 
 * # Using in deployment verification
 * if curl -f http://localhost:3000/api/health; then
 *   echo "Deployment verified"
 * else
 *   echo "Deployment failed health check"
 *   exit 1
 * fi
 * 
 * # Monitoring / Alerting
 * Response time < 1000ms = Healthy
 * Response time > 2000ms = Degraded
 * Any other status = Critical
 * 
 * # Kubernetes Probe
 * livenessProbe:
 *   httpGet:
 *     path: /api/health
 *     port: 3000
 *   initialDelaySeconds: 10
 *   periodSeconds: 10
 * 
 * readinessProbe:
 *   httpGet:
 *     path: /api/health
 *     port: 3000
 *   initialDelaySeconds: 5
 *   periodSeconds: 5
 */
