import { readFileSync } from 'fs';

export interface MiddlewareConfig {
  middleware: Record<string, string>;
}

export function loadMiddlewareConfig(path: string): Partial<{
  error: boolean;
  middleware: Record<string, string>;
}> {
  const config = require(path);

  if (config) {
    return config as MiddlewareConfig;
  } else {
    return {
      error: true,
    };
  }
}
