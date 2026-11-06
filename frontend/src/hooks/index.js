"use client";
import { useState, useEffect } from "react";

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
