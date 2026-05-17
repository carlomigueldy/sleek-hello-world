export interface Greeting {
  message: string;
  timestamp: string;
}

export function buildGreeting(name?: string): Greeting {
  return {
    message: `Hello, ${name ?? "World"}.`,
    timestamp: new Date().toISOString(),
  };
}
