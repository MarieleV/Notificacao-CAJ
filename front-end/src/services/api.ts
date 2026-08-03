// mudar URL para o endpoint correto da API
const BASE_URL = "https://notificacao-caj-7ncb.vercel.app/api";

{ /* ----------------- Tela de Geração de Notificação --------------------- */ }

// Definindo os tipos de dados que vamos enviar 
export interface GerarNotificacaoPayload {
  api_key: string;
  textos_base: string[];
  dataConstatacao: string;
  protocolo: string;
  funcionario: string;
  equipe: string;
}

export interface ExportarDocumentoPayload {
  texto_final: string;
  protocolo: string;
  autoInfracao: string;
  matricula: string;
  nomeCliente: string;
  logradouro: string;
  bairro: string;
  cep: string;
  localizacao: string;
  categoriaTarifa: string;
  numeroHidrometro: string;
}

// 1. Serviço para Gerar o Texto (IA)
export async function gerarNotificacaoApi(payload: GerarNotificacaoPayload) {
  const response = await fetch(`${BASE_URL}/gerar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erro na comunicação com o servidor ao gerar notificação");
  }

  return response.json(); // Retorna o objeto { texto_gerado: "..." }
}

// 2. Serviço para Exportar Word
export async function exportarWordApi(payload: ExportarDocumentoPayload) {
  const response = await fetch(`${BASE_URL}/exportar_word`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erro ao gerar arquivo Word");
  }

  return response.blob(); // Retorna o arquivo binário
}

// 3. Serviço para Exportar PDF
export async function exportarPdfApi(payload: ExportarDocumentoPayload) {
  const response = await fetch(`${BASE_URL}/exportar_pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erro ao gerar arquivo PDF");
  }

  return response.blob(); // Retorna o arquivo binário
}

{ /* ----------------- Tela de Processo Ouvidoria --------------------- */ }

export interface ExportarParecerPayload {
  texto_final: string;
  numeroProcesso: string;
  tipoCaso: string;
  decisao: string | null;
}

export const exportarParecerPDF = async (payload: ExportarParecerPayload): Promise<Blob> => {
  const response = await fetch(`${BASE_URL}/exportar_parecer_pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Erro ao gerar PDF no servidor.");
  return response.blob();
};

export const exportarParecerWord = async (payload: ExportarParecerPayload): Promise<Blob> => {
  const response = await fetch(`${BASE_URL}/exportar_parecer_word`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Erro ao gerar Word no servidor.");
  return response.blob();
};