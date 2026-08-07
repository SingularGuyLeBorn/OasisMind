/**
 * RSC / SSR 侧 tRPC 查询（走 Next rewrite 或 SERVER_INTERNAL_URL）
 */

function getServerBaseUrl(): string {
  return (
    process.env.SERVER_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_SERVER_URL ??
    "http://127.0.0.1:3010"
  );
}

type TrpcBatchItem<T> = {
  result?: { data?: { json?: T } };
  error?: { message?: string };
};

type TrpcFetchOpts = {
  /** Next fetch 缓存秒数；默认 no-store（管理态）。首页/关于等公开面可传 15~60 */
  revalidate?: number;
};

async function trpcFetch<T>(
  procedure: string,
  input: unknown | undefined,
  opts?: TrpcFetchOpts,
): Promise<T> {
  const url = new URL(`${getServerBaseUrl()}/api/trpc/${procedure}`);
  url.searchParams.set("batch", "1");
  url.searchParams.set("input", JSON.stringify({ 0: { json: input ?? null } }));

  const init: RequestInit & { next?: { revalidate: number } } =
    opts?.revalidate != null && opts.revalidate >= 0
      ? { next: { revalidate: opts.revalidate } }
      : { cache: "no-store" };

  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`tRPC ${procedure} HTTP ${res.status}`);
  }

  const batch = (await res.json()) as TrpcBatchItem<T>[];
  const first = batch[0];
  if (first?.error?.message) {
    throw new Error(first.error.message);
  }
  if (!first?.result?.data) {
    throw new Error(`tRPC ${procedure} 返回空数据`);
  }
  return first.result.data.json as T;
}

/** 无 input 的 tRPC query（superjson batch GET） */
export async function trpcQuery<T>(procedure: string): Promise<T>;
/** 带 input 的 tRPC query（superjson batch GET） */
export async function trpcQuery<T>(procedure: string, input: unknown): Promise<T>;
export async function trpcQuery<T>(procedure: string, input?: unknown): Promise<T> {
  return trpcFetch<T>(procedure, input);
}

/** 公开面可缓存查询（减轻切回首页/关于时的服务端等待） */
export async function trpcQueryCached<T>(
  procedure: string,
  input?: unknown,
  revalidateSeconds = 30,
): Promise<T> {
  return trpcFetch<T>(procedure, input, { revalidate: revalidateSeconds });
}
