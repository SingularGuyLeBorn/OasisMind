/**
 * 内置 onSuccess（invalidate）必须盖在调用方 options 之上。
 * 若 `...options` 写在后面，调用方传入的 onSuccess 会整段替换内置逻辑。
 */
export function mergeMutationOptions<TRes>(
  options: Record<string, unknown> | undefined,
  onBuiltInSuccess: (res: TRes) => void,
): Record<string, unknown> {
  const callerOnSuccess = options?.onSuccess;
  return {
    ...(options ?? {}),
    onSuccess: (res: TRes, ...rest: unknown[]) => {
      onBuiltInSuccess(res);
      if (typeof callerOnSuccess === "function") {
        callerOnSuccess(res, ...rest);
      }
    },
  };
}
