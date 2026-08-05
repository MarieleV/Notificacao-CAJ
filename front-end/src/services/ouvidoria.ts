import { Funcionario, FUNCIONARIOS } from "../utils/funcionarios";

export type DecisaoType = "deferir" | "indeferir" | "parcial" | null;
export type TipoCasoType = "leitura" | "servico" | "corte_cavalete" | "hd" | "bypass" | "clandestina" | "la_padronizada" | "la_cadastral" | "prorrogacao";
export type DefesaType = "com_defesa" | "sem_defesa";