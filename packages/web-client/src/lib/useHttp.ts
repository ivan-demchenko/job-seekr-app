import { useEffect, useState } from "react";
import * as RD from './remote-data';
import { ZodError, type ZodSchema } from "zod";
import { CaseEmpty, CasePayload } from "./case";

export type HTTPConfig<T> = {
  url: string,
  decoder: ZodSchema<T>,
  method?: string,
  body?: string,
  onError?: (error: HTTPError) => void
}

const Unauthenticated = () => new CaseEmpty('Unauthenticated' as const);
const BadResponse = (details: string) => new CasePayload('BadResponse' as const, details);
const NetworkError = (details: string) => new CasePayload('NetworkError' as const, details);
export type HTTPError =
  | ReturnType<typeof Unauthenticated>
  | ReturnType<typeof BadResponse>
  | ReturnType<typeof NetworkError>

export function useHTTP<T extends { toString: () => string }>(
  config: HTTPConfig<T>
) {
  const [response, setResponse] = useState<RD.Status<T, HTTPError>>(RD.Idle());

  useEffect(() => {
    const ac = new AbortController();
    async function runFetch() {
      try {
        setResponse(RD.Loading());

        const resp = await fetch(config.url, {
          method: config.method || 'GET',
          headers: { 'Accept': 'application/json' },
          body: config.body,
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
    runFetch();
    return () => {
      setResponse(RD.Idle());
      return ac.abort();
    }
  }, [config.url, config.method, config.decoder, config.body]);

  return { state: response };
}