import axios from 'axios';
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';
import { providerConfigs } from '../configs/providerConfigs';
import { projectConfig } from '../configs/projectConfig';
import { Opportunity } from '../models/opportunity';
import { OpportunityCategory, YieldOpportunity } from '../types';
import { ProviderFetchError, KafkaConnectionError, RedisConnectionError, isCustomError } from '../errors';
import { PAGINATION_DEFAULTS } from '../constants';

export class IngestionService {
  private kafka: Kafka;
  private producer: ReturnType<Kafka['producer']>;
  private consumer: ReturnType<Kafka['consumer']>;
  private redis: Redis;
  private intervals: NodeJS.Timeout[] = [];

  constructor() {
    this.kafka = new Kafka({
      clientId: projectConfig.kafka.clientId,
      brokers: projectConfig.kafka.brokers,
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'yield-group' });
    this.redis = new Redis({
      host: projectConfig.redis.host,
      port: projectConfig.redis.port,
      retryStrategy: (times) => Math.min(times * 1000, 30000),
    });
  }

  private async withRetry<T>(
      operation: () => Promise<T>,
      errorType: typeof ProviderFetchError | typeof KafkaConnectionError | typeof RedisConnectionError,
      context: string,
      maxAttempts = projectConfig.retry.maxAttempts,
      retryIntervals = projectConfig.retry.intervalsMs
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
        const errorMsg = isCustomError(error) ? error.message : `Unknown error: ${JSON.stringify(error)}`;
        console.error(`[${new Date().toISOString()}] ${context} (attempt ${attempt}/${maxAttempts}): ${errorMsg}`);
        if (attempt === maxAttempts) {
          console.error(`[${new Date().toISOString()}] ${context}: Max retries reached, serving cached data`);
          throw new errorType(`${context}: Max retries reached`, errorType.name, { originalError: error });
        }
        const delay = retryIntervals[attempt - 1] || retryIntervals[retryIntervals.length - 1];
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new errorType(`${context}: Max retries reached`);
  }

  async fetchProviderData(config: typeof providerConfigs[0]): Promise<YieldOpportunity[]> {
    try {
      return await this.withRetry(
          async () => {
            const response = await axios.get(config.apiUrl, { timeout: projectConfig.fetchTimeout });
            const parsed = config.parseResponse(response.data);
            return parsed.map((data) => Opportunity.normalize(data, config));
          },
          ProviderFetchError,
          `Failed to fetch from ${config.name}`
      );
    } catch (error: unknown) {
      console.error(`[${new Date().toISOString()}] Failed to fetch from ${config.name} after retries, serving cached data`);
      return [];
    }
  }

  async start() {
    await this.withRetry(
        async () => {
          await this.producer.connect();
          console.log(`[${new Date().toISOString()}] Kafka producer connected`);
        },
        KafkaConnectionError,
        'Failed to connect Kafka producer'
    );

    await this.withRetry(
        async () => {
          await this.consumer.connect();
          await this.consumer.subscribe({ topic: projectConfig.kafka.topic, fromBeginning: false });
          console.log(`[${new Date().toISOString()}] Kafka consumer subscribed to ${projectConfig.kafka.topic}`);
        },
        KafkaConnectionError,
        'Failed to connect Kafka consumer'
    );

    await this.withRetry(
        async () => {
          await this.redis.ping();
          console.log(`[${new Date().toISOString()}] Redis connected`);
        },
        RedisConnectionError,
        'Failed to connect to Redis'
    );

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const opportunities: YieldOpportunity[] = JSON.parse(message.value?.toString() || '[]');
          const pipeline = this.redis.pipeline();
          for (const opp of opportunities) {
            const key = `opportunity:${opp.id}`;
            pipeline.hmset(key, {
              id: opp.id,
              name: opp.name,
              provider: opp.provider,
              asset: opp.asset,
              chain: opp.chain,
              apr: String(opp.apr ?? null),
              category: opp.category,
              liquidity: opp.liquidity,
              riskScore: String(opp.riskScore),
              updatedAt: opp.updatedAt,
            });
            pipeline.expire(key, projectConfig.cacheTtl);
          }
          await pipeline.exec();
          console.log(`[${new Date().toISOString()}] Updated Redis with ${opportunities.length} opportunity hashes`);
        } catch (error: unknown) {
          const errorMsg = isCustomError(error) ? error.message : 'Unknown error';
          console.error(`[${new Date().toISOString()}] Failed to process Kafka message: ${errorMsg}`);
        }
      },
    });

    providerConfigs.forEach((config) => {
      const fetchAndPublish = async () => {
        try {
          const newOpportunities = await this.fetchProviderData(config);
          const { opportunities: currentOpportunities } = await this.getOpportunities({ page: 1, pageSize: Number.MAX_SAFE_INTEGER });
          const updatedOpportunities = [
            ...currentOpportunities.filter((opp) => opp.provider !== config.name),
            ...newOpportunities,
          ];
          await this.producer.send({
            topic: projectConfig.kafka.topic,
            messages: [{ value: JSON.stringify(updatedOpportunities) }],
          });
          console.log(`[${new Date().toISOString()}] Published ${newOpportunities.length} opportunities from ${config.name}`);
        } catch (error: unknown) {
          const errorMsg = isCustomError(error) ? error.message : 'Unknown error';
          console.error(`[${new Date().toISOString()}] Failed to fetch/publish for ${config.name}: ${errorMsg}`);
        }
      };

      fetchAndPublish();
      this.intervals.push(setInterval(fetchAndPublish, config.fetchInterval));
    });
  }

  async stop() {
    try {
      this.intervals.forEach(clearInterval);
      await this.producer.disconnect();
      await this.consumer.disconnect();
      await this.redis.quit();
      console.log(`[${new Date().toISOString()}] Ingestion service stopped`);
    } catch (error: unknown) {
      const errorMsg = isCustomError(error) ? error.message : 'Unknown error';
      console.error(`[${new Date().toISOString()}] Failed to stop ingestion service: ${errorMsg}`);
    }
  }

  async getOpportunities({ page = PAGINATION_DEFAULTS.PAGE, pageSize = PAGINATION_DEFAULTS.PAGE_SIZE } = {}): Promise<{
    opportunities: YieldOpportunity[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const keys = await this.redis.keys('opportunity:*');
      if (keys.length === 0) {
        console.log(`[${new Date().toISOString()}] No opportunities in Redis`);
        return { opportunities: [], totalItems: 0, totalPages: 0, currentPage: page };
      }

      const pipeline = this.redis.pipeline();
      keys.forEach((key) => pipeline.hgetall(key));
      const results = await pipeline.exec();
      if (!results) {
        console.log(`[${new Date().toISOString()}] No results from Redis pipeline`);
        return { opportunities: [], totalItems: 0, totalPages: 0, currentPage: page };
      }

      const opportunities: YieldOpportunity[] = results
      .filter((result): result is [null, Record<string, string>] => result !== null && result[0] === null && !!result[1])
      .map(([_, data]) => ({
        id: data.id,
        name: data.name,
        provider: data.provider,
        asset: data.asset,
        chain: data.chain as 'ethereum' | 'solana',
        apr: data.apr === 'null' ? null : parseFloat(data.apr),
        category: data.category as OpportunityCategory,
        liquidity: data.liquidity as 'liquid' | 'locked',
        riskScore: parseInt(data.riskScore),
        updatedAt: data.updatedAt,
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      const totalItems = opportunities.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const currentPage = Math.max(1, Math.min(page, totalPages));
      const start = (currentPage - 1) * pageSize;
      const paginatedOpportunities = opportunities.slice(start, start + pageSize);

      console.log(`[${new Date().toISOString()}] Served ${paginatedOpportunities.length} opportunities from Redis (page ${currentPage}, total ${totalItems})`);
      return { opportunities: paginatedOpportunities, totalItems, totalPages, currentPage };
    } catch (error: unknown) {
      const errorMsg = isCustomError(error) ? error.message : 'Unknown error';
      console.error(`[${new Date().toISOString()}] Failed to get opportunities from Redis: ${errorMsg}`);
      return { opportunities: [], totalItems: 0, totalPages: 0, currentPage: page };
    }
  }
}