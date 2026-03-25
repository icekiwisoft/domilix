export interface LaravelPaginationOptions {
  total: number;
  page: number;
  perPage: number;
  path: string;
  query?: object;
}

const stringifyQuery = (query: Record<string, unknown>) => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null && item !== '') {
          params.append(key, String(item));
        }
      }
      continue;
    }

    params.set(key, String(value));
  }

  return params.toString();
};

const pageUrl = (path: string, query: Record<string, unknown>, page: number) => {
  const serialized = stringifyQuery({ ...query, page });
  return serialized ? `${path}?${serialized}` : path;
};

export const buildLaravelPagination = <T>(
  data: T[],
  options: LaravelPaginationOptions,
) => {
  const { total, page, perPage, path, query = {} } = options;
  const normalizedQuery = query as Record<string, unknown>;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? null : (page - 1) * perPage + 1;
  const to = total === 0 ? null : Math.min(page * perPage, total);

  return {
    data,
    links: {
      first: total === 0 ? null : pageUrl(path, normalizedQuery, 1),
      last: total === 0 ? null : pageUrl(path, normalizedQuery, lastPage),
      prev: page > 1 ? pageUrl(path, normalizedQuery, page - 1) : null,
      next: page < lastPage ? pageUrl(path, normalizedQuery, page + 1) : null,
    },
    meta: {
      current_page: page,
      from,
      last_page: lastPage,
      path,
      per_page: perPage,
      to,
      total,
    },
  };
};
