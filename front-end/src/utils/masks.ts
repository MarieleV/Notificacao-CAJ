// ─────────────────────────────────────────────────────────────────────────
// lib/masks.ts
// Máscaras de input e formatadores usados nos formulários.
//
// NOTA: a antiga `maskDate()` (máscara manual de DD/MM/AAAA por digitação)
// foi removida por ser código morto — estava definida em FineCalculator.tsx
// e NotificationDrafter.tsx mas nunca era chamada em nenhum dos dois (ambos
// usam o componente <DatePicker /> visual em vez de input mascarado).
// ─────────────────────────────────────────────────────────────────────────

/** Aplica máscara MM/AAAA a partir de dígitos digitados livremente. */
export function maskMonthYear(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2);
}

/** Aplica máscara de moeda brasileira (ex: "1360" -> "13,60") a partir de dígitos. */
export function maskBRL(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const val = parseInt(digits, 10) / 100;
  return val.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Formata um número como moeda brasileira completa (ex: 13.6 -> "R$ 13,60"). */
export function fmtBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Capitaliza um nome próprio, mantendo preposições ("da", "de", "do"...) em minúsculo. */
export function formatName(name: string): string {
  if (!name) return "";
  const lowerCaseWords = ["da", "de", "do", "das", "dos", "e"];
  return name
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (index !== 0 && lowerCaseWords.includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}