// ─────────────────────────────────────────────────────────────────────────
// lib/dates.ts
// Fonte única de verdade para: parsing/format de datas, feriados e dias úteis.
// Antes esta lógica estava duplicada (quase 100% idêntica) em:
//   FineCalculator.tsx, OuvidoriaManager.tsx, RespostaDefesaManager.tsx,
//   NotificationDrafter.tsx
// ─────────────────────────────────────────────────────────────────────────

export const MONTHS_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
] as const;

export const WEEKDAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"] as const;

// Lista oficial de feriados e emendas (extraída da planilha de referência).
// Mantida como Set para lookup O(1) em vez de Array.includes (O(n)).
const FERIADOS_E_FDS = new Set([
  "2025-08-30", "2025-08-31", "2025-09-06", "2025-09-07", "2025-09-13", "2025-09-14", "2025-09-20", "2025-09-21",
  "2025-09-27", "2025-09-28", "2025-10-04", "2025-10-05", "2025-10-11", "2025-10-12", "2025-10-18", "2025-10-19",
  "2025-10-25", "2025-10-26", "2025-11-01", "2025-11-02", "2025-11-08", "2025-11-09", "2025-11-15", "2025-11-16",
  "2025-11-20", "2025-11-21", "2025-11-22", "2025-11-23", "2025-11-29", "2025-11-30", "2025-12-06", "2025-12-07",
  "2025-12-13", "2025-12-14", "2025-12-20", "2025-12-21", "2025-12-22", "2025-12-23", "2025-12-24", "2025-12-25",
  "2025-12-26", "2025-12-27", "2025-12-28", "2025-12-29", "2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02",
  "2026-01-03", "2026-01-04", "2026-01-10", "2026-01-11", "2026-01-17", "2026-01-18", "2026-01-24", "2026-01-25",
  "2026-01-31", "2026-02-01", "2026-02-07", "2026-02-08", "2026-02-14", "2026-02-15", "2026-02-16", "2026-02-17",
  "2026-02-21", "2026-02-22", "2026-02-28", "2026-03-01", "2026-03-07", "2026-03-08", "2026-03-09", "2026-03-14",
  "2026-03-15", "2026-03-21", "2026-03-22", "2026-03-28", "2026-03-29", "2026-04-03", "2026-04-04", "2026-04-05",
  "2026-04-11", "2026-04-12", "2026-04-18", "2026-04-19", "2026-04-20", "2026-04-21", "2026-04-25", "2026-04-26",
  "2026-05-01", "2026-05-02", "2026-05-03", "2026-05-09", "2026-05-10", "2026-05-16", "2026-05-17", "2026-05-23",
  "2026-05-24", "2026-05-30", "2026-05-31", "2026-06-04", "2026-06-05", "2026-06-06", "2026-06-07", "2026-06-13",
  "2026-06-14", "2026-06-20", "2026-06-21", "2026-06-27", "2026-06-28", "2026-07-04", "2026-07-05", "2026-07-11",
  "2026-07-12", "2026-07-18", "2026-07-19", "2026-07-25", "2026-07-26", "2026-08-01", "2026-08-02", "2026-08-08",
  "2026-08-09", "2026-08-15", "2026-08-16", "2026-08-22", "2026-08-23", "2026-08-29", "2026-08-30", "2026-09-05",
  "2026-09-06", "2026-09-07", "2026-09-12", "2026-09-13", "2026-09-19", "2026-09-20", "2026-09-26", "2026-09-27",
  "2026-10-03", "2026-10-04", "2026-10-10", "2026-10-11", "2026-10-12", "2026-10-17", "2026-10-18", "2026-10-24",
  "2026-10-25", "2026-10-31", "2026-11-01", "2026-11-02", "2026-11-07", "2026-11-08", "2026-11-14", "2026-11-15",
  "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-28", "2026-11-29", "2026-12-05", "2026-12-06", "2026-12-12",
  "2026-12-13", "2026-12-19", "2026-12-20", "2026-12-24", "2026-12-25", "2026-12-26", "2026-12-27", "2026-12-28",
  "2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02", "2027-01-03", "2027-01-09", "2027-01-10",
  "2027-01-16", "2027-01-17", "2027-01-23", "2027-01-24", "2027-01-30", "2027-01-31", "2027-02-06", "2027-02-07",
  "2027-02-08", "2027-02-09", "2027-02-13", "2027-02-14", "2027-02-20", "2027-02-21", "2027-02-27", "2027-02-28",
  "2027-03-06", "2027-03-07", "2027-03-08", "2027-03-09", "2027-03-13", "2027-03-14", "2027-03-20", "2027-03-21",
  "2027-03-26", "2027-03-27", "2027-03-28", "2027-04-03", "2027-04-04", "2027-04-10", "2027-04-11", "2027-04-17",
  "2027-04-18", "2027-04-21", "2027-04-24", "2027-04-25", "2027-05-01", "2027-05-02", "2027-05-08", "2027-05-09",
  "2027-05-15", "2027-05-16", "2027-05-22", "2027-05-23", "2027-05-27", "2027-05-28", "2027-05-29", "2027-05-30",
  "2027-06-05", "2027-06-06", "2027-06-12", "2027-06-13", "2027-06-19", "2027-06-20", "2027-06-26", "2027-06-27",
  "2027-07-03", "2027-07-04", "2027-07-10", "2027-07-11", "2027-07-17", "2027-07-18", "2027-07-24", "2027-07-25",
  "2027-07-31", "2027-08-01", "2027-08-07", "2027-08-08", "2027-08-14", "2027-08-15", "2027-08-21", "2027-08-22",
  "2027-08-28", "2027-08-29", "2027-09-04", "2027-09-05", "2027-09-06", "2027-09-07", "2027-09-11", "2027-09-12",
  "2027-09-18", "2027-09-19", "2027-09-25", "2027-09-26", "2027-10-02", "2027-10-03", "2027-10-09", "2027-10-10",
  "2027-10-11", "2027-10-12", "2027-10-16", "2027-10-17", "2027-10-23", "2027-10-24", "2027-10-30", "2027-10-31",
  "2027-11-01", "2027-11-02", "2027-11-06", "2027-11-07", "2027-11-13", "2027-11-14", "2027-11-15", "2027-11-20",
  "2027-11-21", "2027-11-27", "2027-11-28", "2027-12-04", "2027-12-05", "2027-12-11", "2027-12-12", "2027-12-18",
  "2027-12-19", "2027-12-24", "2027-12-25", "2027-12-26", "2027-12-27", "2027-12-28", "2027-12-29", "2027-12-30",
  "2027-12-31",
]);

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Verifica se a data é sábado, domingo ou feriado/emenda cadastrado. */
export function isNonBusinessDay(d: Date): boolean {
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  return isWeekend || FERIADOS_E_FDS.has(toISODate(d));
}

/** Soma N dias úteis a uma data, pulando fins de semana e feriados. */
export function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (!isNonBusinessDay(d)) added++;
  }
  return d;
}

/** Conta dias úteis estritamente entre duas datas (exclusive start, inclusive end). */
export function businessDaysBetween(start: Date, end: Date): number {
  let count = 0;
  const current = new Date(start);
  while (current < end) {
    current.setDate(current.getDate() + 1);
    if (!isNonBusinessDay(current)) count++;
  }
  return count;
}

// ─── Parsing / formatação ────────────────────────────────────────────────

/** Converte "DD/MM/AAAA" em Date, validando o calendário. Retorna null se inválido. */
export function parseFullDate(s: string): Date | null {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  if (month < 1 || month > 12) return null;
  const d = new Date(year, month - 1, day);
  if (d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return d;
}

/** Formata Date em "DD/MM/AAAA". */
export function formatFullDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
}

/** Rótulo amigável ("16 jul 2026") para exibição. Retorna a string original se inválida. */
export function labelFullDate(s: string): string {
  const d = parseFullDate(s);
  if (!d) return s;
  return d
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .replace(".", "");
}

/** Converte "MM/AAAA" em Date (dia 1). Retorna null se inválido. */
export function parseMonthYear(s: string): Date | null {
  const m = s.match(/^(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const month = parseInt(m[1], 10);
  const year = parseInt(m[2], 10);
  if (month < 1 || month > 12) return null;
  return new Date(year, month - 1, 1);
}

/** Formata Date em "MM/AAAA". */
export function formatMonthYear(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${month}/${d.getFullYear()}`;
}

/** Rótulo amigável ("jul 2026") para exibição. Retorna a string original se inválida. */
export function labelMonth(mmyyyy: string): string {
  const d = parseMonthYear(mmyyyy);
  if (!d) return mmyyyy;
  return d
    .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(".", "")
    .replace(/^\w/, (c) => c.toUpperCase());
}

// ─── Funções de negócio (usadas nos formulários de prazo) ────────────────

/** Soma `duration` dias úteis a partir de "DD/MM/AAAA". Retorna "" se entrada inválida. */
export function calculateEndDate(startDateStr: string, duration: number): string {
  if (!startDateStr || !duration || isNaN(duration)) return "";
  const d = parseFullDate(startDateStr);
  if (!d) return "";
  return formatFullDate(addBusinessDays(d, duration));
}

/** Data (DD/MM/AAAA) daqui a 60 dias úteis — usado nos prazos de padronização/prorrogação. */
export function get60BusinessDaysFromToday(): string {
  return formatFullDate(addBusinessDays(new Date(), 60));
}

/** Diferença em dias úteis entre duas datas "DD/MM/AAAA", em qualquer ordem. */
export function getBusinessDaysDifference(date1: string, date2: string): number {
  const d1 = parseFullDate(date1);
  const d2 = parseFullDate(date2);
  if (!d1 || !d2) return 0;
  const start = d1.getTime() <= d2.getTime() ? d1 : d2;
  const end = d1.getTime() <= d2.getTime() ? d2 : d1;
  return businessDaysBetween(start, end);
}