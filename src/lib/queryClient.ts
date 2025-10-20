 import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Throws an error if the fetch response is not OK.
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Generic API request helper for POST, PUT, DELETE, etc.
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown
): Promise<Response> {
  const apiBase = process.env.REACT_APP_API_URL || window.location.origin;

  const res = await fetch(`${apiBase}${endpoint}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

/**
 * Behavior for handling unauthorized (401) responses
 */
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Generic query function factory for use with React Query
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> = ({ on401: unauthorizedBehavior }) => async ({ queryKey }) => {
  try {
    const apiBase = process.env.REACT_APP_API_URL || window.location.origin;
    const endpoint = queryKey[0] as string;

    // Cache-busting param
    const url = new URL(`${apiBase}${endpoint}`);
    url.searchParams.set("_ts", Date.now().toString());

    const res = await fetch(url.toString(), { credentials: "include" });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.warn("Unauthorized (401) detected — returning null.");
      return null as unknown as T;
    }

    await throwIfResNotOk(res);
    const json = await res.json();
    console.log("Fetched:", url.toString(), json);
    return json;
  } catch (error) {
    console.error("Query function error:", error);
    throw error;
  }
};

/**
 * Create and export a global QueryClient with sensible defaults
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
