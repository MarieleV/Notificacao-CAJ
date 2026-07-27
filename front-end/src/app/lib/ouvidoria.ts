export interface Funcionario {
  matricula: number;
  nome: string;
}

export const FUNCIONARIOS: Funcionario[] = [
  { matricula: 769, nome: "Adriana Schons" },
  { matricula: 864, nome: "Alfredino Schaldag" },
  { matricula: 674, nome: "Anderson Vieira Marcos" },
  { matricula: 633, nome: "Angelo Linhares Pinto" },
  { matricula: 594, nome: "Artur Corsani Nishitani" },
  { matricula: 541, nome: "Bernardo Theodoro Santos Dutra" },
  { matricula: 751, nome: "Carlos Clemilton Andrade De Oliveira" },
  { matricula: 763, nome: "Cristiano Bruch" },
  { matricula: 646, nome: "Debora Evans Teixeira" },
  { matricula: 1228, nome: "Edir Lamin" },
  { matricula: 1559, nome: "Eduardo Limberger Netto" },
  { matricula: 744, nome: "Elvis Gunther Dahnert" },
  { matricula: 888, nome: "Emanuelle De Carvalho Alves" },
  { matricula: 770, nome: "Fabiano Da Silva" },
  { matricula: 861, nome: "Gilmar Fernandes Da Silveira" },
  { matricula: 1324, nome: "Glauber Antonio Fachin" },
  { matricula: 750, nome: "Jonata Da Silva" },
  { matricula: 761, nome: "Jose Moacir Fabian Junior" },
  { matricula: 827, nome: "Larissa Welter Emidio" },
  { matricula: 587, nome: "Leandro Buch" },
  { matricula: 402, nome: "Maira Fuchter" },
  { matricula: 852, nome: "Marcel Gai" },
  { matricula: 826, nome: "Marcio Monteiro Da Silva" },
  { matricula: 1674, nome: "Marcio Roberto Pereira" },
  { matricula: 635, nome: "Marcos Moises Muller" },
  { matricula: 1723, nome: "Matheus Simoes Gomes De Freitas" },
  { matricula: 522, nome: "Peroaldo De Souza Santos" },
  { matricula: 314, nome: "Valter Carlos Estephanes" },
  { matricula: 960, nome: "Vilmar Vieira De Meneses" },
];

export type DecisaoType = "deferir" | "indeferir" | "parcial" | null;
export type TipoCasoType = "leitura" | "servico" | "corte_cavalete" | "hd" | "bypass" | "clandestina" | "la_padronizada" | "la_cadastral" | "prorrogacao";
export type DefesaType = "com_defesa" | "sem_defesa";