  import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Helper function to throw an error if the fetch response is not OK
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to extract response text or fallback to status text
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Generic API request function supporting GET, POST, PUT, DELETE, etc.
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

// Define behavior type for handling unauthorized (401) responses
type UnauthorizedBehavior = "returnNull" | "throw";

// Create a generic query function factory that adds cache busting and logs
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> = ({ on401: unauthorizedBehavior }) => async ({ queryKey }) => {
  try {
    // Construct the URL and append a cache-busting timestamp parameter
    const url = new URL(queryKey[0] as string, window.location.origin);
    url.searchParams.set("_ts", Date.now().toString());

    // Log the fetch URL for debugging purposes
    console.log(`Fetching data from: ${url.toString()}`);

    // Perform the fetch request with credentials included (cookies, etc.)
    const res = await fetch(url.toString(), {
      credentials: "include",
    });

    // Handle unauthorized responses based on the given behavior
    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.warn("Unauthorized request detected (401), returning null as per config.");
      return null as unknown as T;
    }

    // Throw error if response is not OK, with detailed message
    if (!res.ok) {
      const text = await res.text();
      console.error(`Fetch error: ${res.status} - ${text}`);
      throw new Error(`${res.status}: ${text}`);
    }

    // Parse and return JSON response data
    const json = await res.json();
    console.log("Fetch successful, received data:", json);
    return json;
  } catch (error) {
    // Log any unexpected errors and rethrow to propagate error states
    console.error("Error in query function:", error);
    throw error;
  }
};

// Instantiate and export a QueryClient with sensible defaults including the cache-busting query function
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
