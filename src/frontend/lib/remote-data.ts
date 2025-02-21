import { CaseEmpty, CasePayload, type Show } from "./case";

export const Idle = () => new CaseEmpty('Idle' as const);
export const Loading = () => new CaseEmpty('Loading' as const);
export const Ready = <T extends Show>(data: T) => new CasePayload('Ready' as const, data);
export const Error = <E extends Show>(error: E) => new CasePayload('Error' as const, error);

export type Status<T extends Show, E extends Show> =
  | ReturnType<typeof Idle>
  | ReturnType<typeof Loading>
  | ReturnType<typeof Ready<T>>
  | ReturnType<typeof Error<E>>
