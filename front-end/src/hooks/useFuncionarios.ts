// Carrega a lista de funcionários da API (só para usuários logados; PA-14).
import { useEffect, useState } from "react";
import { Funcionario, listarFuncionarios } from "../services/funcionarios";

export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [erroFuncionarios, setErroFuncionarios] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    listarFuncionarios()
      .then((lista) => {
        if (!cancelado) setFuncionarios(lista);
      })
      .catch((err) => {
        if (!cancelado) setErroFuncionarios(err instanceof Error ? err.message : "Não foi possível carregar a lista de funcionários.");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  return { funcionarios, erroFuncionarios };
}
