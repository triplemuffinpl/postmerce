export type LogLevel = "debug" | "info" | "warn" | "error";

const secretKeyPattern = /(token|secret|password|authorization|client_secret)/i;

function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactValue);
  }

  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      output[key] = secretKeyPattern.test(key) ? "[redacted]" : redactValue(nestedValue);
    }
    return output;
  }

  return value;
}

export function redactPayload(payload: Record<string, unknown>): Record<string, unknown> {
  return redactValue(payload) as Record<string, unknown>;
}

export class Logger {
  public info(context: string, message: string, payload: Record<string, unknown> = {}): void {
    this.write("info", context, message, payload);
  }

  public warn(context: string, message: string, payload: Record<string, unknown> = {}): void {
    this.write("warn", context, message, payload);
  }

  public error(context: string, message: string, payload: Record<string, unknown> = {}): void {
    this.write("error", context, message, payload);
  }

  private write(
    level: LogLevel,
    context: string,
    message: string,
    payload: Record<string, unknown>
  ): void {
    const entry = {
      level,
      context,
      message,
      payload: redactPayload(payload),
      timestamp: new Date().toISOString()
    };

    console.log(JSON.stringify(entry));
  }
}

export const logger = new Logger();
