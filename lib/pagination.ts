/**
 * Utility per gestire la paginazione nelle API
 */

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: PaginationMetadata;
}

/**
 * Estrae i parametri di paginazione dalla URL search params
 */
export function getPaginationParams(
  searchParams: URLSearchParams,
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10)),
  );
  const sort = searchParams.get("sort") || undefined;
  const order =
    searchParams.get("order") === "desc" ? "desc" : ("asc" as const);

  return { page, limit, sort, order };
}

/**
 * Calcola skip e take per Prisma query
 */
export function getPrismaSkipTake(params: PaginationParams) {
  const skip = (params.page - 1) * params.limit;
  const take = params.limit;
  return { skip, take };
}

/**
 * Crea l'oggetto orderBy per Prisma basato sui parametri di sort
 */
export function getPrismaOrderBy(
  params: PaginationParams,
  defaultSort: string = "createdAt",
): Record<string, "asc" | "desc"> {
  const sortField = params.sort || defaultSort;
  return { [sortField]: params.order || "desc" };
}

/**
 * Crea i metadata di paginazione
 */
export function createPaginationMetadata(
  total: number,
  params: PaginationParams,
): PaginationMetadata {
  const totalPages = Math.ceil(total / params.limit);
  const hasNextPage = params.page < totalPages;
  const hasPrevPage = params.page > 1;

  return {
    total,
    page: params.page,
    limit: params.limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
}

/**
 * Crea una risposta paginata completa
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  return {
    data,
    metadata: createPaginationMetadata(total, params),
  };
}
