"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient, ApiError } from "./apiClient";

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ApiState<D, M> {
  path: string | null;
  data?: D;
  meta?: M;
  error: ApiError | null;
  loading: boolean;
}

/**
 * @param path  Endpoint to fetch. Pass null to skip.
 * @param options.keepPrevious  When true, previous data/meta stay visible
 *   while a new path is loading (table dims in place). Opt-in so pages
 *   that must not show stale data for a different entity (e.g. courses
 *   for another department) keep the default behaviour.
 */
export function useApi<D = unknown, M = PageMeta>(
  path: string | null,
  options?: { keepPrevious?: boolean },
) {
  const keepPrevious = options?.keepPrevious ?? false;

  const [state, setState] = useState<ApiState<D, M>>({
    path,
    error: null,
    loading: !!path,
  });

  const seq = useRef(0);

  // Initial fetch and automatic refetch when the path changes.
  useEffect(() => {
    if (path === null) return;

    const requestPath = path;
    const id = ++seq.current;
    let active = true;

    // Mark loading; optionally keep previous data visible.
    setState((previous) => ({
      path: requestPath,
      data: keepPrevious && previous.path !== null ? previous.data : undefined,
      meta: keepPrevious && previous.path !== null ? previous.meta : undefined,
      error: null,
      loading: true,
    }));

    async function fetchData() {
      try {
        const response = await apiClient(requestPath);

        if (active && id === seq.current) {
          setState({
            path: requestPath,
            data: response.data,
            meta: response.meta,
            error: null,
            loading: false,
          });
        }
      } catch (e) {
        if (active && id === seq.current) {
          setState((previous) => ({
            path: requestPath,
            // Keep previous data on error when keepPrevious is on so the
            // table does not go blank.
            data: keepPrevious ? previous.data : undefined,
            meta: keepPrevious ? previous.meta : undefined,
            error: e as ApiError,
            loading: false,
          }));
        }
      }
    }

    void fetchData();

    const requestId = id;
    return () => {
      active = false;
      if (seq.current === requestId) {
        seq.current++;
      }
    };
  }, [path, keepPrevious]);

  // Manual reload.
  const reload = useCallback(async () => {
    if (path === null) {
      setState({
        path: null,
        error: null,
        loading: false,
      });
      return;
    }

    const requestPath = path;
    const id = ++seq.current;

    setState((previous) => ({
      ...previous,
      path: requestPath,
      error: null,
      loading: true,
      // Keep previous data during reload when keepPrevious is set.
      data: keepPrevious ? previous.data : previous.data,
      meta: keepPrevious ? previous.meta : previous.meta,
    }));

    try {
      const response = await apiClient(requestPath);

      if (id === seq.current) {
        setState({
          path: requestPath,
          data: response.data,
          meta: response.meta,
          error: null,
          loading: false,
        });
      }
    } catch (e) {
      if (id === seq.current) {
        setState((previous) => ({
          path: requestPath,
          data: keepPrevious ? previous.data : undefined,
          meta: keepPrevious ? previous.meta : undefined,
          error: e as ApiError,
          loading: false,
        }));
      }
    }
  }, [path, keepPrevious]);

  // When keepPrevious is false, do not expose data belonging to a previous path.
  const matchesPath = state.path === path;
  const showPrevious = keepPrevious && state.data !== undefined;

  return {
    data: path && (matchesPath || showPrevious) ? state.data : undefined,
    meta: path && (matchesPath || showPrevious) ? state.meta : undefined,
    error: path && matchesPath ? state.error : null,
    loading: !!path && (!matchesPath || state.loading),
    reload,
  };
}

export function useDebounced<T>(value: T, ms = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, ms);

    return () => clearTimeout(timer);
  }, [value, ms]);

  return debouncedValue;
}