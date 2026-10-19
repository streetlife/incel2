import { $fetch, type FetchOptions } from "ofetch";
import type { ApiError } from "../types/api";
import { useRuntimeConfig } from "nuxt/app";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

export class AppApiError extends Error {
  userMessage: string;
  status: number;
  fieldErrors: Record<string, string[]>;

  constructor(body: string | ApiError, status = 0) {
    const message = typeof body === "string" ? body : body.message;
    super(message);
    this.name = "";
    this.userMessage = message;
    this.status = typeof body === "string" ? status : (body.status ?? status);
    this.fieldErrors = typeof body === "string" ? {} : (body.errors ?? {});
  }
}

/**
 * Human-friendly messages shown to users.
 *
 * Raw transport errors from the API client (ofetch), for example
 * `[POST] "https://...": <no response> Failed to fetch`, must never reach the
 * UI, so every failure is mapped to one of these messages.
 */
const OFFLINE_ERROR_MESSAGE =
  "You appear to be offline. Please check your internet connection and try again.";
const NETWORK_ERROR_MESSAGE =
  "We're having trouble connecting to our servers. Please try again in a moment.";
const SERVER_ERROR_MESSAGE =
  "Something went wrong on our end. Please try again later.";
const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

/**
 * Choose the right wording for a transport failure.
 *
 * A 5xx response that is missing CORS headers is reported by the browser as
 * `net::ERR_FAILED` and is unreadable by JS, so we treat it as "can't connect".
 * Only claim the user is offline when the browser actually says so.
 */
function networkErrorMessage(): string {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return OFFLINE_ERROR_MESSAGE;
  }
  return NETWORK_ERROR_MESSAGE;
}

/** Map an HTTP status code to a friendly, non-technical message. */
function friendlyHttpMessage(status: number): string {
  switch (status) {
    case 400:
      return "We couldn't process that request. Please check your details and try again.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      return "We couldn't find what you were looking for.";
    case 408:
    case 504:
      return "The request took too long. Please try again.";
    case 409:
      return "There was a conflict with your request. Please refresh and try again.";
    case 419:
      return "Your session expired. Please refresh the page and try again.";
    case 422:
      return "Some of the details you entered aren't valid. Please review and try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    default:
      return status >= 500 ? SERVER_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE;
  }
}

/**
 * Detect a request that never produced an HTTP response (offline, DNS
 * failure, CORS, connection reset, …).
 */
export function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("failed to load") ||
    msg.includes("network error") ||
    msg.includes("networkerror") ||
    msg.includes("network request failed") ||
    msg.includes("fetch failed") ||
    msg.includes("no response") ||
    msg.includes("err_failed") ||
    msg.includes("load failed") ||
    msg.includes("net::err") ||
    msg.includes("access to fetch") ||
    msg.includes("cors") ||
    msg.includes("offline")
  );
}

/** Detect user/browser initiated request aborts, which must not be masked. */
function isAbortError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.name === "AbortError" ||
    (err as any).code === 20 ||
    (err as any).code === "ABORT_ERR"
  );
}

/**
 * Convert any thrown value into an {@link AppApiError} carrying a friendly,
 * user-safe message. Abort errors are returned untouched so callers can still
 * detect them, and non-API errors (e.g. local validation) are left as-is.
 *
 * This is the single funnel that keeps raw `FetchError` output
 * (`[POST] "…": <no response> Failed to fetch`) out of the UI.
 */
export function toFriendlyApiError(err: unknown): unknown {
  if (err instanceof AppApiError) return err;
  if (isAbortError(err)) return err;

  if (isNetworkError(err)) {
    return new AppApiError(networkErrorMessage(), 0);
  }

  const status = Number(
    (err as any)?.status ?? (err as any)?.response?.status ?? 0,
  );
  if (Number.isFinite(status) && status >= 400) {
    return new AppApiError({ message: friendlyHttpMessage(status), status }, status);
  }

  return err;
}

/**
 * Heuristic for spotting machine-facing error text: request dumps, URLs,
 * browser/network internals, raw server errors, etc. These must never be
 * rendered to users.
 */
function looksTechnical(message: string): boolean {
  const m = message.toLowerCase().trim();
  if (!m) return false;
  return (
    /^\[(get|post|put|patch|delete)\]/.test(m) ||
    m.includes("<no response>") ||
    m.includes("failed to fetch") ||
    m.includes("failed to load") ||
    m.includes("networkerror") ||
    m.includes("net::err") ||
    m.includes("access to fetch") ||
    m.includes("cors") ||
    m.includes("econnrefused") ||
    m.includes("etimedout") ||
    m.includes("enotfound") ||
    m.includes("internal server error") ||
    m.includes("bad gateway") ||
    m.includes("service unavailable") ||
    m.includes("request failed with status code") ||
    /https?:\/\//.test(m)
  );
}

/**
 * Resolve any thrown value into a message that is always safe to render.
 *
 * This is the final safety net for UI code: even if a raw technical error
 * bypasses the API client (or arrives from a browser-level failure such as a
 * CORS-blocked 500), the user only ever sees friendly copy.
 */
export function toDisplayMessage(
  err: unknown,
  fallback: string = GENERIC_ERROR_MESSAGE,
): string {
  if (isAbortError(err)) return "The request was cancelled.";

  const friendly = toFriendlyApiError(err);
  if (friendly instanceof AppApiError) {
    return friendly.userMessage || fallback;
  }
  if (
    friendly instanceof Error &&
    friendly.message &&
    !looksTechnical(friendly.message)
  ) {
    return friendly.message;
  }
  return fallback;
}

export function parseApiError(err: unknown): AppApiError {
  if (err instanceof AppApiError) return err;

  const body: unknown =
    (err as any)?.data ??
    (err as any)?.response?.data ??
    (err as any)?.body ??
    null;

  const status: number =
    (err as any)?.status ?? (err as any)?.response?.status ?? 0;

  if (body && typeof body === "object") {
    const b = body as Partial<ApiError>;
    const fieldMessages = Object.values(b.errors ?? {}).flat();
    const candidate = fieldMessages[0] ?? b.message;
    const message =
      candidate && !looksTechnical(candidate)
        ? candidate
        : friendlyHttpMessage(status);
    return new AppApiError({ message, status, errors: b.errors }, status);
  }

  const raw = err instanceof Error ? err.message : "";
  const message = isNetworkError(err)
    ? networkErrorMessage()
    : raw && !looksTechnical(raw)
      ? raw
      : friendlyHttpMessage(status);
  return new AppApiError({ message, status }, status);
}

export function useApi() {
  const config = useRuntimeConfig();
  const authStore = useAuthStore();
  const router = useRouter();

  const instance = $fetch.create({
    baseURL: config.public.apiBase + "/api",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    onRequest({ options }) {
      const headers =
        options.headers instanceof Headers
          ? options.headers
          : new Headers(options.headers);

      if (authStore.token) {
        headers.set("Authorization", `Bearer ${authStore.token}`);
      }

      if (!(options.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }

      options.headers = headers;

      if (import.meta.dev) {
        console.log(
          `[API] → ${options.method ?? "GET"} ${options.baseURL}${(options as any).url ?? ""}`,
        );
      }
    },
    async onResponseError({ response }) {
      const status = response.status;
      const data = response._data;

      const isServerError = status >= 500;

      const rawServerMessage =
        Object.values(data?.errors ?? {}).flat()[0] || data?.message;
      const serverMessage =
        typeof rawServerMessage === "string" &&
        !looksTechnical(rawServerMessage)
          ? rawServerMessage
          : "";

      const body: ApiError = {
        message: isServerError
          ? SERVER_ERROR_MESSAGE
          : serverMessage || friendlyHttpMessage(status),
        status,
        errors: isServerError ? undefined : data?.errors,
      };

      if (import.meta.dev) {
        console.error(`[API] ✗ ${status}`, body);
      }

      if (status === 401) {
        authStore.logout();
        await router.push({ path: "/auth/login" });

        const message =
          body.message || "Your session has expired. Please log in again.";

        throw new AppApiError({ message, status, errors: data?.errors }, 401);
      }

      if (status === 419) {
        throw new AppApiError(
          {
            message:
              body.message || "Security token expired. Please try again.",
            status,
            errors: body.errors,
          },
          419,
        );
      }

      throw new AppApiError(body, status);
    },
  } satisfies FetchOptions);

  const api = async <T = unknown>(
    request: string,
    options?: FetchOptions,
  ): Promise<T> => {
    try {
      return await instance<T>(request, options as any);
    } catch (error) {
      throw toFriendlyApiError(error);
    }
  };

  return api as unknown as typeof instance;
}

export function normaliseError(err: unknown): string {
  if (err instanceof AppApiError) return err.userMessage || GENERIC_ERROR_MESSAGE;
  if (isAbortError(err)) return "The request was cancelled.";
  if (isNetworkError(err)) return networkErrorMessage();
  return toDisplayMessage(err);
}
