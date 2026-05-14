export class DbError {
  readonly type = "db-error" as const;

  constructor(
    readonly context: string,
    readonly error: unknown,
  ) {}
}
