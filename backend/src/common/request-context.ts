import { AsyncLocalStorage } from 'node:async_hooks';
import { Request } from 'express';

export interface RequestMetadata {
  ipAddress: string | null;
  macAddress: string | null;
}

const requestContext = new AsyncLocalStorage<RequestMetadata>();

const readHeader = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
};

const normalizeIpAddress = (value: string | null) => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (trimmed === '::1') {
    return '127.0.0.1';
  }

  if (trimmed.startsWith('::ffff:')) {
    return trimmed.slice(7);
  }

  return trimmed;
};

export const extractRequestMetadata = (req: Request): RequestMetadata => {
  const forwardedFor = readHeader(req.headers['x-forwarded-for']);
  const realIp = readHeader(req.headers['x-real-ip']);
  const rawMac =
    readHeader(req.headers['x-client-mac-address']) ??
    readHeader(req.headers['x-client-mac']) ??
    readHeader(req.headers['x-mac-address']);

  const ipAddress = normalizeIpAddress(
    forwardedFor?.split(',')[0] ||
    realIp ||
    req.ip ||
    null,
  );

  const macAddress = rawMac?.trim() || null;

  return {
    ipAddress,
    macAddress,
  };
};

export const RequestContext = {
  run<T>(metadata: RequestMetadata, callback: () => T) {
    return requestContext.run(metadata, callback);
  },
  get() {
    return requestContext.getStore();
  },
};
