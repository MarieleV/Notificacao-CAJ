import { apiFetch, throwApiError } from "./http";

{ /* ----------------- Tela de Geração de Notificação --------------------- */ }

// tipos de dados que vamos enviar 
export interface GerarNotificacaoPayload {
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
  const response = await apiFetch(`/gerar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwApiError(response, "Erro na comunicação com o servidor ao gerar notificação.");
  }

  return response.json();
}

// 2. Serviço para Exportar Word
export async function exportarWordApi(payload: ExportarDocumentoPayload) {
  const response = await apiFetch(`/exportar_word`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwApiError(response, "Erro ao gerar arquivo Word.");
  }

  return response.blob(); 
}

// 3. Serviço para Exportar PDF
export async function exportarPdfApi(payload: ExportarDocumentoPayload) {
  const response = await apiFetch(`/exportar_pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwApiError(response, "Erro ao gerar arquivo PDF.");
  }

  return response.blob(); 
}

{ /* ----------------- Pareceres (Ouvidoria e Retorno de Defesa) --------------------- */ }

// O back-end só usa `texto_final` (e `tipoCaso` no nome do arquivo do cabeçalho);
// os demais campos são opcionais e mantidos para identificar o caso na requisição.
export interface ExportarParecerPayload {
  texto_final: string;
  // Ouvidoria
  numeroProcesso?: string;
  tipoCaso?: string;
  decisao?: string | null;
  // Retorno de Defesa
  protocolo?: string;
  autoInfracao?: string;
  matricula?: string;
}

export const exportarParecerPDF = async (payload: ExportarParecerPayload): Promise<Blob> => {
  const response = await apiFetch(`/exportar_parecer_pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) await throwApiError(response, "Erro ao gerar PDF no servidor.");
  return response.blob();
};

export const exportarParecerWord = async (payload: ExportarParecerPayload): Promise<Blob> => {
  const response = await apiFetch(`/exportar_parecer_word`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) await throwApiError(response, "Erro ao gerar Word no servidor.");
  return response.blob();
};