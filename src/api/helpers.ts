import { useState } from 'react';
import {
  QueryClient,
  UndefinedInitialDataOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { z, ZodError } from 'zod';
import { client } from './axios';
import { BackendResponse } from './entities';

interface EnhancedMutationParams<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> extends Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    'mutationFn' | 'onSuccess' | 'onError' | 'onSettled'
  > {
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext,
    queryClient: QueryClient
  ) => unknown;
  onError?: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined,
    queryClient: QueryClient
  ) => unknown;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext | undefined,
    queryClient: QueryClient
  ) => unknown;
}

interface EnhancedMutationParamsWithoutBody<TData = unknown, TError = Error, TContext = unknown>
  extends Omit<
    UseMutationOptions<TData, TError, TContext>,
    'mutationFn' | 'onSuccess' | 'onError' | 'onSettled'
  > {
  onSuccess?: (data: TData, context: TContext, queryClient: QueryClient) => unknown;
  onError?: (error: TError, context: TContext | undefined, queryClient: QueryClient) => unknown;
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    context: TContext | undefined,
    queryClient: QueryClient
  ) => unknown;
}

/**
 * Create a URL with query parameters and route parameters
 *
 * @param base - The base URL with route parameters
 * @param queryParams - The query parameters
 * @param routeParams - The route parameters
 * @returns The URL with query parameters
 * @example
 * createUrl('/api/operators/:id', { page: 1 }, { id: 1 });
 * // => '/api/operators/1?page=1'
 */
function createUrl(
  base: string,
  queryParams?: Record<string, string | number | undefined>,
  routeParams?: Record<string, string | number | undefined>
) {
  const url = Object.entries(routeParams ?? {}).reduce(
    (acc, [key, value]) => acc.replaceAll(`:${key}`, String(value)),
    base
  );

  if (!queryParams) return url;

  const query = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.append(key, String(value));
  });

  return `${url}?${query.toString()}`;
}

type QueryKey = [string] | [string, Record<string, string | number | undefined>];

function getQueryKey(
  queryKey: QueryKey,
  route: Record<string, string | number | undefined> = {},
  query: Record<string, string | number | undefined> = {}
) {
  const [mainKey, otherKeys = {}] = queryKey;

  return [mainKey, { ...otherKeys, ...route, ...query }];
}

/** Handle request errors */
function handleRequestError(error: unknown) {
  if (isAxiosError(error)) {
    throw error.response?.data;
  }

  if (error instanceof ZodError) {
    console.error(error.format());
  }

  console.log(error);

  throw error;
}

/* ----------------------------------- GET ---------------------------------- */

interface CreateGetQueryHookArgs<ResponseSchema extends z.ZodType> {
  /** The endpoint for the GET request */
  endpoint: string;
  /** The Zod schema for the response data */
  responseSchema: ResponseSchema;
  /** The query parameters for the react-query hook */
  rQueryParams: Omit<UndefinedInitialDataOptions, 'queryFn' | 'queryKey'> & {
    queryKey: QueryKey;
  };
}

/**
 * Create a custom hook for performing GET requests with react-query and Zod validation
 *
 * @example
 * const useGetUser = createGetQueryHook<typeof userSchema, { id: string }>({
 *   endpoint: '/api/operators/:id',
 *   responseSchema: userSchema,
 *   rQueryParams: { queryKey: ['getUser'] },
 * });
 *
 * const { data, error } = useGetUser({ route: { id: 1 } });
 */
export function createGetQueryHook<
  ResponseSchema extends z.ZodType,
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({ endpoint, responseSchema, rQueryParams }: CreateGetQueryHookArgs<ResponseSchema>) {
  const queryFn = async (params?: { query?: QueryParams; route?: RouteParams }) => {
    const url = createUrl(endpoint, params?.query, params?.route);
    return client
      .get(url)
      .then((response) => responseSchema.parse(BackendResponse.parse(response.data).data))
      .catch(handleRequestError);
  };

  return (params?: { query?: QueryParams; route?: RouteParams }) =>
    useQuery({
      ...rQueryParams,
      queryKey: getQueryKey(rQueryParams.queryKey, params?.route, params?.query),
      queryFn: () => queryFn(params),
    }) as UseQueryResult<z.infer<ResponseSchema>>;
}

/* ---------------------------------- POST ---------------------------------- */

interface CreatePostMutationHookArgs<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType,
> {
  /** The endpoint for the POST request */
  endpoint: string;
  /** The Zod schema for the request body */
  bodySchema: BodySchema;
  /** The Zod schema for the response data */
  responseSchema: ResponseSchema;
  /** The mutation parameters for the react-query hook */
  rMutationParams?: EnhancedMutationParams<z.infer<ResponseSchema>, Error, z.infer<BodySchema>>;
  options?: { isMultipart?: boolean };
}

/**
 * Create a custom hook for performing POST requests with react-query and Zod validation
 *
 * @example
 * const useCreateOperator = createPostMutationHook({
 *  endpoint: '/api/operators',
 *  bodySchema: createUserSchema,
 *  responseSchema: userSchema,
 *  rMutationParams: { onSuccess: () => queryClient.invalidateQueries('getUsers') },
 * });
 */
export function createPostMutationHook<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType | undefined = undefined,
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({
  endpoint,
  bodySchema,
  responseSchema,
  rMutationParams,
  options,
}: Omit<
  CreatePostMutationHookArgs<
    BodySchema,
    ResponseSchema extends z.ZodType ? ResponseSchema : z.ZodType<any>
  >,
  'responseSchema'
> & {
  responseSchema?: ResponseSchema;
}) {
  return (params?: { query?: QueryParams; route?: RouteParams }) => {
    const queryClient = useQueryClient();
    const baseUrl = createUrl(endpoint, params?.query, params?.route);

    const mutationFn = async ({
      variables,
      route,
      query,
    }: {
      variables: z.infer<BodySchema>;
      query?: QueryParams;
      route?: RouteParams;
    }) => {
      const url = createUrl(baseUrl, query, route);

      const config = options?.isMultipart
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined;

      return client
        .post(url, bodySchema.parse(variables), config)
        .then((response) =>
          responseSchema
            ? responseSchema.parse(BackendResponse.parse(response.data).data)
            : BackendResponse.parse(response.data).data
        )
        .catch(handleRequestError);
    };

    return useMutation({
      ...rMutationParams,
      mutationFn,
      onSuccess: (data, variables, context) =>
        rMutationParams?.onSuccess?.(data, variables, context, queryClient),
      onError: (error, variables, context) =>
        rMutationParams?.onError?.(error, variables, context, queryClient),
      onSettled: (data, error, variables, context) =>
        rMutationParams?.onSettled?.(data, error, variables, context, queryClient),
    });
  };
}

/* ----------------------------------- PUT ---------------------------------- */

interface createPatchMutationHookArgs<ResponseSchema extends z.ZodType> {
  /** The endpoint for the PUT request */
  endpoint: string;
  /** The Zod schema for the request body */
  /** The Zod schema for the response data */
  responseSchema: ResponseSchema;
  /** The mutation parameters for the react-query hook */
  rMutationParams?: EnhancedMutationParamsWithoutBody<z.infer<ResponseSchema>, Error>;
  options?: { isMultipart?: boolean };
}

/**
 * Create a custom hook for performing PUT requests with react-query and Zod validation
 *
 * @example
 * const useUpdateUser = createPutMutationHook<typeof updateUserSchema, typeof userSchema, { id: string }>({
 *  endpoint: '/api/operators/:id',
 *  bodySchema: updateUserSchema,
 *  responseSchema: userSchema,
 *  rMutationParams: { onSuccess: () => queryClient.invalidateQueries('getUsers') },
 * });
 */
export function createPatchMutationHook<
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({
  endpoint,
  rMutationParams,
  options,
}: Omit<createPatchMutationHookArgs<z.ZodType>, 'responseSchema'>) {
  return (params?: { query?: QueryParams; route?: RouteParams }) => {
    const queryClient = useQueryClient();
    const baseUrl = createUrl(endpoint, params?.query, params?.route);
    const mutationFn = async ({ route, query }: { query?: QueryParams; route?: RouteParams }) => {
      const url = createUrl(baseUrl, query, route);

      const config = options?.isMultipart
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined;

      return client
        .patch(url, config)
        .then((response) => BackendResponse.parse(response.data))
        .catch(handleRequestError);
    };

    return useMutation({
      ...rMutationParams,
      mutationFn,
      onSuccess: (data, context) => rMutationParams?.onSuccess?.(data, context, queryClient),
      onError: (error, context) => rMutationParams?.onError?.(error, context, queryClient),
      onSettled: (data, error, context) =>
        rMutationParams?.onSettled?.(data, error, context, queryClient),
    });
  };
}

/* ----------------------------------- PUT ---------------------------------- */

interface CreatePutMutationHookArgs<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType,
> {
  /** The endpoint for the PUT request */
  endpoint: string;
  /** The Zod schema for the request body */
  bodySchema: BodySchema;
  /** The Zod schema for the response data */
  responseSchema: ResponseSchema;
  /** The mutation parameters for the react-query hook */
  rMutationParams?: EnhancedMutationParams<z.infer<ResponseSchema>, Error, z.infer<BodySchema>>;
  options?: { isMultipart?: boolean };
}

/**
 * Create a custom hook for performing PUT requests with react-query and Zod validation
 *
 * @example
 * const useUpdateUser = createPutMutationHook<typeof updateUserSchema, typeof userSchema, { id: string }>({
 *  endpoint: '/api/operators/:id',
 *  bodySchema: updateUserSchema,
 *  responseSchema: userSchema,
 *  rMutationParams: { onSuccess: () => queryClient.invalidateQueries('getUsers') },
 * });
 */
export function createPutMutationHook<
  BodySchema extends z.ZodType,
  ResponseSchema extends z.ZodType | undefined = undefined,
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({
  endpoint,
  bodySchema,
  responseSchema,
  rMutationParams,
  options,
}: Omit<
  CreatePutMutationHookArgs<
    BodySchema,
    ResponseSchema extends z.ZodType ? ResponseSchema : z.ZodType<any>
  >,
  'responseSchema'
> & {
  responseSchema?: ResponseSchema;
}) {
  return (params?: { query?: QueryParams; route?: RouteParams }) => {
    const queryClient = useQueryClient();
    const baseUrl = createUrl(endpoint, params?.query, params?.route);
    const mutationFn = async ({
      variables,
      route,
      query,
    }: {
      variables: z.infer<BodySchema>;
      query?: QueryParams;
      route?: RouteParams;
    }) => {
      const url = createUrl(baseUrl, query, route);

      const config = options?.isMultipart
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined;

      return client
        .put(url, bodySchema.parse(variables), config)
        .then((response) =>
          responseSchema
            ? responseSchema.parse(BackendResponse.parse(response.data))
            : BackendResponse.parse(response.data)
        )
        .catch(handleRequestError);
    };

    return useMutation({
      ...rMutationParams,
      mutationFn,
      onSuccess: (data, variables, context) =>
        rMutationParams?.onSuccess?.(data, variables, context, queryClient),
      onError: (error, variables, context) =>
        rMutationParams?.onError?.(error, variables, context, queryClient),
      onSettled: (data, error, variables, context) =>
        rMutationParams?.onSettled?.(data, error, variables, context, queryClient),
    });
  };
}

/* --------------------------------- DELETE --------------------------------- */

interface CreateDeleteMutationHookArgs<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> {
  /** The endpoint for the DELETE request */
  endpoint: string;
  /** The mutation parameters for the react-query hook */
  rMutationParams?: EnhancedMutationParams<TData, TError, TVariables, TContext>;
}

/**
 * Create a custom hook for performing DELETE requests with react-query
 *
 * @example
 * const useDeleteUser = createDeleteMutationHook<typeof userSchema, { id: string }>({
 *  endpoint: '/api/operators/:id',
 *  rMutationParams: { onSuccess: () => queryClient.invalidateQueries('getUsers') },
 * });
 */
export function createDeleteMutationHook<
  ModelSchema extends z.ZodType,
  RouteParams extends Record<string, string | number | undefined> = {},
  QueryParams extends Record<string, string | number | undefined> = {},
>({
  endpoint,
  rMutationParams,
}: CreateDeleteMutationHookArgs<z.infer<ModelSchema>, Error, z.infer<ModelSchema>>) {
  return (params?: { query?: QueryParams; route?: RouteParams }) => {
    const queryClient = useQueryClient();
    const baseUrl = createUrl(endpoint, params?.query, params?.route);

    const mutationFn = async ({ route, query }: { query?: QueryParams; route?: RouteParams }) => {
      const url = createUrl(baseUrl, query, route);
      return client.delete(url).catch(handleRequestError);
    };

    return useMutation({
      ...rMutationParams,
      mutationFn,
      onSuccess: (data, variables, context) =>
        rMutationParams?.onSuccess?.(data, variables, context, queryClient),
      onError: (error, variables, context) =>
        rMutationParams?.onError?.(error, variables, context, queryClient),
      onSettled: (data, error, variables, context) =>
        rMutationParams?.onSettled?.(data, error, variables, context, queryClient),
    });
  };
}

/* ------------------------------- PAGINATION ------------------------------- */

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export function usePagination(params?: PaginationParams) {
  const [page, setPage] = useState(params?.page ?? 1);
  const [limit, setLimit] = useState(params?.limit ?? 15);

  const onChangeLimit = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  return { page, limit, setPage, setLimit: onChangeLimit };
}

export const PaginationMetaSchema = z.object({
  total: z.number().int().min(0),
  perPage: z.number().int(),
  currentPage: z.number().int().nullable(),
  lastPage: z.number().int(),
  firstPage: z.number().int(),
  firstPageUrl: z.string(),
  lastPageUrl: z.string(),
  nextPageUrl: z.string().nullable(),
  previousPageUrl: z.string().nullable(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

interface CreatePaginationQueryHookArgs<DataSchema extends z.ZodType> {
  /** The endpoint for the GET request */
  endpoint: string;
  /** The Zod schema for the data attribute in response */
  dataSchema: DataSchema;
  /** The query parameters for the react-query hook */
  rQueryParams: Omit<UndefinedInitialDataOptions, 'queryFn' | 'queryKey'> & {
    queryKey: QueryKey;
  };
}

export type SortableQueryParams = {
  sort?: `${string}:${'asc' | 'desc'}`;
};

/**
 * Create a custom hook for performing paginated GET requests with react-query and Zod validation
 *
 * @example
 * const useGetUsers = createPaginatedQueryHook<typeof userSchema>({
 *  endpoint: '/api/operators',
 *  dataSchema: userSchema,
 *  queryParams: { queryKey: 'getUsers' },
 * });
 */
export function createPaginationQueryHook<
  DataSchema extends z.ZodType,
  QueryParams extends Record<string, string | number | undefined> = SortableQueryParams,
  RouteParams extends Record<string, string | number | undefined> = {},
>({ endpoint, dataSchema, rQueryParams }: CreatePaginationQueryHookArgs<DataSchema>) {
  const queryFn = async (params: {
    query?: QueryParams & PaginationParams;
    route?: RouteParams;
  }) => {
    const url = createUrl(endpoint, params?.query, params?.route);

    const schema = z.object({
      data: dataSchema.array(),
      meta: PaginationMetaSchema,
    });

    return client
      .get(url)
      .then((response) => schema.parse(BackendResponse.parse(response.data).data))
      .catch(handleRequestError);
  };

  return (params?: { query: QueryParams & PaginationParams; route?: RouteParams }) => {
    const query = { page: 1, limit: 25, ...params?.query } as unknown as QueryParams;
    const route = params?.route ?? ({} as RouteParams);

    return useQuery({
      ...rQueryParams,
      queryKey: getQueryKey(rQueryParams.queryKey, route, query),
      queryFn: () => queryFn({ query, route }),
    }) as UseQueryResult<{ meta: PaginationMeta; data: z.infer<DataSchema>[] }>;
  };
}
