import { useCallback, useEffect, useState } from "react";
import { api } from "./api/client.js";

/** Loads `path` on mount (and whenever it changes). Returns { data, error, loading, reload, setData }. */
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path, { signal: controller.signal })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name !== "AbortError") setState({ data: null, error, loading: false });
      });
    return () => controller.abort();
  }, [path, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === "function" ? updater(s.data) : updater })), []);

  return { ...state, reload, setData };
}

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | EVENT HUB` : "EVENT HUB";
  }, [title]);
}
