export class ProviderFetchError extends Error {
  constructor(message: string, public readonly code: string = 'PROVIDER_FETCH_ERROR', public readonly details?: any) {
    super(message);
    this.name = 'ProviderFetchError';
  }
}

export class KafkaConnectionError extends Error {
  constructor(message: string, public readonly code: string = 'KAFKA_CONNECTION_ERROR', public readonly details?: any) {
    super(message);
    this.name = 'KafkaConnectionError';
  }
}

export class RedisConnectionError extends Error {
  constructor(message: string, public readonly code: string = 'REDIS_CONNECTION_ERROR', public readonly details?: any) {
    super(message);
    this.name = 'RedisConnectionError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly code: string = 'VALIDATION_ERROR', public readonly details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ServiceError extends Error {
  constructor(message: string, public readonly code: string = 'SERVICE_ERROR', public readonly details?: any) {
    super(message);
    this.name = 'ServiceError';
  }
}

export function isCustomError(error: any): error is ProviderFetchError | KafkaConnectionError | RedisConnectionError | ValidationError | ServiceError {
  return error instanceof ProviderFetchError ||
      error instanceof KafkaConnectionError ||
      error instanceof RedisConnectionError ||
      error instanceof ValidationError ||
      error instanceof ServiceError;
}