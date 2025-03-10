export interface Show {
  toString(): string;
}

export class CasePayload<Kind, Payload extends Show> implements Show {
  constructor(
    public _kind: Kind,
    public _payload: Payload,
  ) {}

  toString(): string {
    return `${this._kind}(${this._payload.toString()})`;
  }
}

export class CaseEmpty<Kind> implements Show {
  constructor(public _kind: Kind) {}

  toString(): string {
    return `${this._kind}`;
  }
}
