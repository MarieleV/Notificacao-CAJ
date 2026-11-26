// Salva os dados no navegador do usuário enquanto a aba estiver aberta.
import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import { avisarFalhaAoSalvar } from "../utils/dadosLocais";

function readValue<T>(key: string, initialValue: T): T {
  try {
    const item = window.sessionStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.warn("Erro ao ler do sessionStorage", error);
    return initialValue;
  }
}

export function useSessionStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  // A chave fica junto do valor para saber a qual chave o valor pertence.
  const [state, setState] = useState(() => ({ key, value: readValue(key, initialValue) }));

  // Se a chave mudar, relê o valor salvo na nova chave (em vez de manter o da chave anterior).
  let current = state;
  if (state.key !== key) {
    current = { key, value: readValue(key, initialValue) };
    setState(current);
  }

  const setStoredValue = useCallback<Dispatch<SetStateAction<T>>>((action) => {
    setState((prev) => ({
      key: prev.key,
      value: typeof action === "function" ? (action as (prevValue: T) => T)(prev.value) : action,
    }));
  }, []);

  // Grava sempre na chave a que o valor pertence.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(state.key, JSON.stringify(state.value));
    } catch (error) {
      // Em geral, espaço cheio: avisa na tela, não só no console (PA-12).
      avisarFalhaAoSalvar("os dados desta tela", error);
    }
  }, [state]);

  return [current.value, setStoredValue];
}
