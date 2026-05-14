export class AppError<T extends string> {
  readonly type: T;
  readonly message: string;
  readonly cause: unknown;

  constructor(type: T, message: string, cause?: unknown) {
    this.type = type;
    this.message = message;
    this.cause = cause;
  }
}
