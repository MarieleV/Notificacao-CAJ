// Base de Dados do Cliente: carregada no Redator, guardada no IndexedDB (kvStorage)
// e consultada pela busca por matrícula do Redator, do Retorno de Defesa e da
// Tabela de Multas (PA-13: antes, cada hook repetia a chave e a conversão).

/** Chave da base de clientes no IndexedDB. */
export const BASE_CLIENTE_KEY = "baseCliente";

/** Linha da base de clientes, como gravada pelo Redator a partir da planilha. */
export interface LinhaBaseCliente {
  id: string;
  matricula: string;
  morador: string;
  endereco: string;
  bairro: string;
  cep: string;
  localizacao: string;
  ativEconomica: string;
  numeroHidrometro: string;
}

/** Dados do cliente exibidos nas telas e enviados nos documentos. */
export interface ClienteLocalizado {
  nomeCliente: string;
  logradouro: string;
  bairro: string;
  cep: string;
  localizacao: string;
  categoriaTarifa: string;
  numeroHidrometro: string;
}

export const CLIENTE_VAZIO: ClienteLocalizado = {
  nomeCliente: "", logradouro: "", bairro: "", cep: "", localizacao: "", categoriaTarifa: "", numeroHidrometro: "",
};

/** Procura a matrícula na base e devolve os dados do cliente, ou `null` se não achar. */
export function buscarClienteNaBase(base: LinhaBaseCliente[], matricula: string): ClienteLocalizado | null {
  const encontrado = base.find((row) => row.matricula === matricula);
  if (!encontrado) return null;
  return {
    nomeCliente: encontrado.morador,
    logradouro: encontrado.endereco,
    bairro: encontrado.bairro,
    cep: encontrado.cep,
    localizacao: encontrado.localizacao,
    categoriaTarifa: encontrado.ativEconomica,
    numeroHidrometro: encontrado.numeroHidrometro,
  };
}
