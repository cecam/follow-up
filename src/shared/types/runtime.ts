type RuntimeData = Record<string, unknown>;
type RuntimeErrorInput = Error | string | null | undefined;

export type RuntimeOk<TData extends RuntimeData = RuntimeData> = TData & {
  ok: true;
};

export type RuntimeFail<TData extends RuntimeData = RuntimeData> = TData & {
  ok: false;
  error: string;
};

export type RuntimeResult<TData extends RuntimeData = RuntimeData> =
  | RuntimeOk<TData>
  | RuntimeFail<RuntimeData>;

export const ok = <TData extends RuntimeData = RuntimeData>(data = {} as TData): RuntimeOk<TData> => ({
  ok: true,
  ...data,
});

export const fail = <TData extends RuntimeData = RuntimeData>(
  error: string,
  data = {} as TData,
): RuntimeFail<TData> => ({
  ok: false,
  error,
  ...data,
});

export const getErrorMessage = (error: RuntimeErrorInput, fallback = 'UNKNOWN_ERROR'): string => {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
};
