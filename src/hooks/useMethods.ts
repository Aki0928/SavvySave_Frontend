import { useCallback, useState } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestData = Record<string, unknown> | FormData | null;

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

interface UseMethodsReturn {
  get: <T = unknown>(url: string) => Promise<T>;
  post: <T = unknown>(url: string, data?: RequestData) => Promise<T>;
  put: <T = unknown>(url: string, data?: RequestData) => Promise<T>;
  patch: <T = unknown>(url: string, data?: RequestData) => Promise<T>;
  del: <T = unknown>(url: string) => Promise<T>;
  loading: boolean;
  error: string | null;
}

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() ?? null;
  }

  return null;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Something went wrong";
};

export const useMethods = (): UseMethodsReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = "http://127.0.0.1:8000/api";

  const request = useCallback(
    async <T = unknown>(
      method: HttpMethod,
      url: string,
      data: RequestData = null,
    ): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const token = getCookie("api_token");

        const headers: Record<string, string> = {
          Accept: "application/json",
        };

        if (!(data instanceof FormData)) {
          headers["Content-Type"] = "application/json";
        }

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const config: RequestInit = {
          method,
          headers,
        };

        if (data) {
          config.body = data instanceof FormData ? data : JSON.stringify(data);
        }

        const response = await fetch(`${baseUrl}${url}`, config);

        const contentType = response.headers.get("content-type");
        const isJson = contentType?.includes("application/json");

        const json = isJson
          ? ((await response.json()) as T & ApiErrorResponse)
          : null;

        if (!response.ok) {
          throw new Error(
            json?.message ||
              json?.error ||
              `Request failed with status ${response.status}`,
          );
        }

        return json as T;
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl],
  );

  const get = useCallback(
    <T = unknown>(url: string): Promise<T> => {
      return request<T>("GET", url);
    },
    [request],
  );

  const post = useCallback(
    <T = unknown>(url: string, data: RequestData = null): Promise<T> => {
      return request<T>("POST", url, data);
    },
    [request],
  );

  const put = useCallback(
    <T = unknown>(url: string, data: RequestData = null): Promise<T> => {
      return request<T>("PUT", url, data);
    },
    [request],
  );

  const patch = useCallback(
    <T = unknown>(url: string, data: RequestData = null): Promise<T> => {
      return request<T>("PATCH", url, data);
    },
    [request],
  );

  const del = useCallback(
    <T = unknown>(url: string): Promise<T> => {
      return request<T>("DELETE", url);
    },
    [request],
  );

  return {
    get,
    post,
    put,
    patch,
    del,
    loading,
    error,
  };
};
