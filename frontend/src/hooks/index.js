"use client";
import { useState, useEffect } from "react";
import { useCallback, useRef } from "react";

/**
 * Load and retain an async resource while ignoring results from stale effects.
 * @param {object} options
 * @param {() => Promise<*>|*} options.load Resource loader.
 * @param {Array<*>} [options.deps=[]] Values that trigger another load.
 * @param {boolean} [options.enabled=true] Whether loading is enabled.
 * @param {*} [options.initialData] Initial resource value.
 * @param {(error: Error) => string} [options.errorMessage] Error-to-message mapper.
 * @param {boolean} [options.clearErrorOnLoad=false] Clear errors at load start.
 * @param {boolean} [options.setUndefinedData=true] Whether undefined results replace current data.
 * @param {(data: *) => void} [options.onSuccess] Callback after a successful load.
 * @param {(error: Error) => void} [options.onError] Callback after a failed load.
 * @returns {{data: *, loading: boolean, error: string, refetch: () => void, setData: Function, setError: Function}}
 */
export function useAsyncResource({
  load,
  deps = [],
  enabled = true,
  initialData,
  errorMessage = (error) => error?.message || "Could not load resource.",
  clearErrorOnLoad = false,
  setUndefinedData = true,
  onSuccess,
  onError,
}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const loadRef = useRef(load);
  const optionsRef = useRef({ errorMessage, clearErrorOnLoad, setUndefinedData, onSuccess, onError });
  const enabledRef = useRef(enabled);
  loadRef.current = load;
  optionsRef.current = { errorMessage, clearErrorOnLoad, setUndefinedData, onSuccess, onError };
  enabledRef.current = enabled;

  useEffect(() => {
    let active = true;
    if (!enabled) {
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    if (optionsRef.current.clearErrorOnLoad) setError("");
    let request;
    try {
      request = loadRef.current();
    } catch (requestError) {
      request = Promise.reject(requestError);
    }
    Promise.resolve(request)
      .then((result) => {
        if (!active) return;
        if (result !== undefined || optionsRef.current.setUndefinedData) setData(result);
        optionsRef.current.onSuccess?.(result);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(optionsRef.current.errorMessage(requestError));
        optionsRef.current.onError?.(requestError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
    // `load` and callbacks are read from refs; `deps` explicitly controls reloads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reloadKey, ...deps]);

  const refetch = useCallback(() => {
    if (!enabledRef.current) return;
    setLoading(true);
    setReloadKey((current) => current + 1);
  }, []);

  return { data, loading, error, refetch, setData, setError };
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) setValue(JSON.parse(item));
    } catch {}
  }, [key]);
  const setStoredValue = (val) => {
    setValue(val);
    try {
      window.localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  };
  return [value, setStoredValue];
}
