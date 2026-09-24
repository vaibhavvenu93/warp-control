export interface ExternalFetchResponse {
  ok: boolean;

  status: number;

  statusText: string;

  url: string;

  headers: Record<
    string,
    string
  >;

  body: string;
}

export interface ExternalFetcher {
  fetch(
    url: string,
    init?: {
      method?: "GET";

      headers?: Record<
        string,
        string
      >;

      signal?: AbortSignal;
    },
  ): Promise<ExternalFetchResponse>;
}

export interface NativeExternalFetcherOptions {
  timeoutMs?: number;

  userAgent?: string;
}

export class NativeExternalFetcher
  implements ExternalFetcher {
  private readonly timeoutMs:
    number;

  private readonly userAgent:
    string;

  constructor(
    options:
      NativeExternalFetcherOptions = {},
  ) {
    this.timeoutMs =
      options.timeoutMs ??
      8_000;

    this.userAgent =
      options.userAgent ??
      "WARP-CONTROL-Market-Radar/1.0";
  }

  async fetch(
    url: string,
    init: {
      method?: "GET";

      headers?: Record<
        string,
        string
      >;

      signal?: AbortSignal;
    } = {},
  ): Promise<ExternalFetchResponse> {
    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        this.timeoutMs,
      );

    const abortFromCaller =
      () =>
        controller.abort();

    if (init.signal) {
      init.signal.addEventListener(
        "abort",
        abortFromCaller,
      );
    }

    try {
      const response =
        await fetch(
          url,
          {
            method:
              init.method ??
              "GET",

            headers: {
              Accept:
                "application/json, text/plain, text/html;q=0.9",

              "User-Agent":
                this.userAgent,

              ...init.headers,
            },

            signal:
              controller.signal,
          },
        );

      const headers:
        Record<
          string,
          string
        > = {};

      response.headers.forEach(
        (
          value,
          key,
        ) => {
          headers[key] =
            value;
        },
      );

      return {
        ok:
          response.ok,

        status:
          response.status,

        statusText:
          response.statusText,

        url:
          response.url,

        headers,

        body:
          await response.text(),
      };
    } finally {
      clearTimeout(
        timeout,
      );

      if (init.signal) {
        init.signal
          .removeEventListener(
            "abort",
            abortFromCaller,
          );
      }
    }
  }
}