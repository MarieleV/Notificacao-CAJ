// Salva os dados no navegador do usuário enquanto a aba estiver aberta.
import { useState, useEffect } from "react";

export function useSessionStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn("Erro ao ler do sessionStorage", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn("Erro ao salvar no sessionStorage", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}