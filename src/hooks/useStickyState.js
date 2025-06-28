// src/hooks/useStickyState.js
import { useState, useCallback } from 'react';

// Função para reviver datas durante o JSON.parse
const dateReviver = (key, value) => {
  const isISO8601 = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
  if (typeof value === 'string' && isISO8601.test(value)) {
    return new Date(value);
  }
  return value;
};

function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(key);
    
    if (stickyValue !== null) {
      try {
        return JSON.parse(stickyValue, dateReviver);
      } catch (e) {
        console.error(`Error parsing sticky state for key "${key}":`, e);
        return defaultValue;
      }
    }
    return defaultValue;
  });

  const setStickyValue = useCallback((newValue) => {
    setValue(newValue);
    window.localStorage.setItem(key, JSON.stringify(newValue));
  }, [key]);

  return [value, setStickyValue];
}

export default useStickyState;