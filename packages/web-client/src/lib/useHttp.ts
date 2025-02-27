import { useEffect, useState } from "react";
import * as RD from './remote-data';
import { ZodError, type ZodSchema } from "zod";
import { CaseEmpty, CasePayload, type Show } from "./case";

export type HTTPGetConfig<T> = {
  url: string,
  decoder: ZodSchema<T>,
  onError?: (error: HTTPError) => void
}

const Unauthenticated = () => new CaseEmpty('Unauthenticated' as const);
const BadResponse = (details: string) => new CasePayload('BadResponse' as const, details);
const NetworkError = (details: string) => new CasePayload('NetworkError' as const, details);
export type HTTPError =
  | ReturnType<typeof Unauthenticated>
  | ReturnType<typeof BadResponse>
  | ReturnType<typeof NetworkError>

async function runFetch<TData extends Show>(
  ac: AbortController,
  config: HTTPGetConfig<TData>,
  setResponse: (status: RD.Status<TData, HTTPError>) => void
) {
  try {
    setResponse(RD.Loading());

    const resp = await fetch(config.url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: ac.signal
    });

    if (!resp.ok) {
      if (resp.status === 401) {
        const err = Unauthenticated();
        setResponse(RD.Error(err));
        return config.onError && config.onError(err);
      }
    }

    const raw = await resp.json();
    const data = config.decoder.parse(raw);

    setResponse(RD.Ready(data));
  } catch (e) {
    if (ac.signal.aborted) {
      return setResponse(RD.Idle());
    }
    if (e instanceof ZodError) {
      const err = BadResponse('Decoding failed due to unexpected data');
      setResponse(RD.Error(err));
      return config.onError && config.onError(err);
    }
    if (e instanceof SyntaxError) {
      const err = BadResponse('Invalid response body');
      setResponse(RD.Error(err));
      return config.onError && config.onError(err);
    }
    if (e instanceof Error) {
      const err = NetworkError(e.message);
      setResponse(RD.Error(err));
      return config.onError && config.onError(err);
    }
    const err = NetworkError('Unknown error');
    setResponse(RD.Error(err));
    return config.onError && config.onError(err);
  }
}

class FetchEntity<TData extends Show> {
  private ac: AbortController;
  constructor(
    private config: HTTPGetConfig<TData>,
    private setResponse: (status: RD.Status<TData, HTTPError>) => void
  ) {
    this.ac = new AbortController();
  }
  run(): Promise<void> {
    return runFetch(this.ac, this.config, this.setResponse);
  }
  retry() {
    this.ac = new AbortController();
  }
  cancel() {
    this.setResponse(RD.Idle());
    this.ac.abort();
  }
}

export function useHTTPGet<TData extends Show>(
  config: HTTPGetConfig<TData>
) {
  const [response, setResponse] = useState<RD.Status<TData, HTTPError>>(RD.Idle());
  const [entity] = useState(
    new FetchEntity(config, setResponse)
  );

  const rerun = () => {
    entity.retry();
    entity.run();
  }

  useEffect(() => {
    entity.retry();
    entity.run();
    return () => {
      return entity.cancel();
    }
  }, [config.url]);

  return {
    state: response,
    cancel: () => entity.cancel(),
    rerun,
  };
}
