export const projectConfig = {
  port: 3000,
  fetchTimeout: 5000, // ms
  cacheTtl: 300, // 5 minutes, Redis TTL in seconds
  retry: {
    maxAttempts: 3,
    intervalsMs: [5000, 10000, 15000], // Retry at 5s, 10s, 15s
  },
  redis: {
    host: 'redis',
    port: 6379,
  },
  kafka: {
    brokers: ['kafka:9092'],
    clientId: 'yield-aggregation-service',
    topic: 'opportunities',
  },
};