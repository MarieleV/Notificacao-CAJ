// NÃO ESTÁ EM USO, MAS MANTIDO PARA REFERÊNCIA FUTURA
// ─── Listas de Vigência ───────────────────────────────────────────────────────

export const VIGENCIAS_AGUA = [
  "01/03/2025 Atual",
  "11/12/2024 a 28/02/2025",
  "01/03/2024 a 10/12/2024",
  "01/03/2023 a 29/02/2024"
];

export const VIGENCIAS_K1 = [
  "15/07/2025 Atual",
  "20/01/2023 a 14/07/2025"
];

// ─── Tipagens das Tarifas ───────────────────────────────────────────────────

export interface TariffTier {
  id: number;
  min: number;
  max: number | string;
  label: string;
  value: string;
}

export interface TariffCategory {
  serviceRate: string;
  tiers: TariffTier[];
}

export interface K1Item {
  category: string;
  activity: string;
  k1: string;
}

// ─── Matriz de Tarifas por Vigência ─────────────────────────────────────────

export const TARIFF_DATA: Record<string, Record<string, TariffCategory>> = {
  "01/03/2025 Atual": {
    "Residencial": {
      serviceRate: "34,93",
      tiers: [
        { id: 1, min: 0, max: 10, label: "Até 10 m³", value: "1,49" },
        { id: 2, min: 11, max: 15, label: "De 11 a 15 m³", value: "9,89" },
        { id: 3, min: 16, max: 25, label: "De 16 a 25 m³", value: "9,95" },
        { id: 4, min: 26, max: 35, label: "De 26 a 35 m³", value: "13,18" },
        { id: 5, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "13,63" }
      ]
    },
    "Residencial Tarifa Social": {
      serviceRate: "10,48",
      tiers: [
        { id: 1, min: 0, max: 10, label: "Até 10 m³", value: "0,45" },
        { id: 2, min: 11, max: 15, label: "De 11 a 15 m³", value: "4,95" },
        { id: 3, min: 16, max: 25, label: "De 16 a 25 m³", value: "9,95" },
        { id: 4, min: 26, max: 35, label: "De 26 a 35 m³", value: "13,18" },
        { id: 5, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "13,63" }
      ]
    },
    "Residencial Social Especial": {
      serviceRate: "10,48",
      tiers: [
        { id: 1, min: 0, max: 15, label: "Até 15 m³", value: "0,30" },
        { id: 2, min: 16, max: 25, label: "De 16 a 25 m³", value: "9,95" },
        { id: 3, min: 26, max: 35, label: "De 26 a 35 m³", value: "13,18" },
        { id: 4, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "13,63" }
      ]
    },
    "Comercial": {
      serviceRate: "58,20",
      tiers: [
        { id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,98" },
        { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "2,06" },
        { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "12,42" },
        { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "12,75" },
        { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "12,86" },
        { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "12,97" }
      ]
    },
    "Comercial Entidade Beneficiente": {
      serviceRate: "29,11",
      tiers: [
        { id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,00" },
        { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "1,03" },
        { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "6,23" },
        { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "6,36" },
        { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "6,44" },
        { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "6,50" }
      ]
    },
    "Industrial": {
      serviceRate: "58,20",
      tiers: [
        { id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,98" },
        { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "2,06" },
        { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "12,42" },
        { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "12,75" },
        { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "12,86" },
        { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "12,97" }
      ]
    },
    "Pública": {
      serviceRate: "58,20",
      tiers: [
        { id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,98" },
        { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "2,06" },
        { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "12,42" },
        { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "12,75" },
        { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "12,86" },
        { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "12,97" }
      ]
    }
  },
  "11/12/2024 a 28/02/2025": {
    "Residencial": { serviceRate: "31,96", tiers: [{ id: 1, min: 0, max: 10, label: "Até 10 m³", value: "1,35" }, { id: 2, min: 11, max: 15, label: "De 11 a 15 m³", value: "9,00" }, { id: 3, min: 16, max: 25, label: "De 16 a 25 m³", value: "9,05" }, { id: 4, min: 26, max: 35, label: "De 26 a 35 m³", value: "12,00" }, { id: 5, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "12,50" }] },
    "Residencial Tarifa Social": { serviceRate: "9,58", tiers: [{ id: 1, min: 0, max: 10, label: "Até 10 m³", value: "0,40" }, { id: 2, min: 11, max: 15, label: "De 11 a 15 m³", value: "9,00" }, { id: 3, min: 16, max: 25, label: "De 16 a 25 m³", value: "9,05" }, { id: 4, min: 26, max: 35, label: "De 26 a 35 m³", value: "12,00" }, { id: 5, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "12,50" }] },
    "Residencial Social Especial": { serviceRate: "9,58", tiers: [{ id: 1, min: 0, max: 15, label: "Até 15 m³", value: "0,28" }, { id: 2, min: 16, max: 25, label: "De 16 a 25 m³", value: "9,05" }, { id: 3, min: 26, max: 35, label: "De 26 a 35 m³", value: "12,00" }, { id: 4, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "12,50" }] },
    "Comercial": { serviceRate: "53,25", tiers: [{ id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,80" }, { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "1,90" }, { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "11,50" }, { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "11,80" }, { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "11,90" }, { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "12,00" }] },
    "Comercial Entidade Beneficiente": { serviceRate: "26,63", tiers: [{ id: 1, min: 0, max: 5, label: "Até 5 m³", value: "0,95" }, { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "0,98" }, { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "5,80" }, { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "5,90" }, { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "6,00" }, { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "6,10" }] },
    "Industrial": { serviceRate: "53,25", tiers: [{ id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,80" }, { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "1,90" }, { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "11,50" }, { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "11,80" }, { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "11,90" }, { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "12,00" }] },
    "Pública": { serviceRate: "53,25", tiers: [{ id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,80" }, { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "1,90" }, { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "11,50" }, { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "11,80" }, { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "11,90" }, { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "12,00" }] }
  },
  "01/03/2024 a 10/12/2024": {
    "Residencial": { serviceRate: "31,96", tiers: [{ id: 1, min: 0, max: 10, label: "Até 10 m³", value: "1,35" }, { id: 2, min: 11, max: 15, label: "De 11 a 15 m³", value: "9,00" }, { id: 3, min: 16, max: 25, label: "De 16 a 25 m³", value: "9,05" }, { id: 4, min: 26, max: 35, label: "De 26 a 35 m³", value: "12,00" }, { id: 5, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "12,50" }] },
    "Residencial Tarifa Social": { serviceRate: "9,58", tiers: [{ id: 1, min: 0, max: 10, label: "Até 10 m³", value: "0,40" }, { id: 2, min: 11, max: 15, label: "De 11 a 15 m³", value: "9,00" }, { id: 3, min: 16, max: 25, label: "De 16 a 25 m³", value: "9,05" }, { id: 4, min: 26, max: 35, label: "De 26 a 35 m³", value: "12,00" }, { id: 5, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "12,50" }] },
    "Residencial Social Especial": { serviceRate: "9,58", tiers: [{ id: 1, min: 0, max: 15, label: "Até 15 m³", value: "0,28" }, { id: 2, min: 16, max: 25, label: "De 16 a 25 m³", value: "9,05" }, { id: 3, min: 26, max: 35, label: "De 26 a 35 m³", value: "12,00" }, { id: 4, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "12,50" }] },
    "Comercial": { serviceRate: "53,25", tiers: [{ id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,80" }, { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "1,90" }, { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "11,50" }, { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "11,80" }, { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "11,90" }, { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "12,00" }] },
    "Comercial Entidade Beneficiente": { serviceRate: "26,63", tiers: [{ id: 1, min: 0, max: 5, label: "Até 5 m³", value: "0,95" }, { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "0,98" }, { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "5,80" }, { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "5,90" }, { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "6,00" }, { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "6,10" }] },
    "Industrial": { serviceRate: "53,25", tiers: [{ id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,80" }, { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "1,90" }, { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "11,50" }, { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "11,80" }, { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "11,90" }, { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "12,00" }] },
    "Pública": { serviceRate: "53,25", tiers: [{ id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,80" }, { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "1,90" }, { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "11,50" }, { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "11,80" }, { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "11,90" }, { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "12,00" }] }
  },
  "01/03/2023 a 29/02/2024": {
    "Residencial": { serviceRate: "30,55", tiers: [{ id: 1, min: 0, max: 10, label: "Até 10 m³", value: "1,30" }, { id: 2, min: 11, max: 15, label: "De 11 a 15 m³", value: "8,65" }, { id: 3, min: 16, max: 25, label: "De 16 a 25 m³", value: "8,70" }, { id: 4, min: 26, max: 35, label: "De 26 a 35 m³", value: "11,53" }, { id: 5, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "11,92" }] },
    "Residencial Tarifa Social": { serviceRate: "9,16", tiers: [{ id: 1, min: 0, max: 10, label: "Até 10 m³", value: "0,39" }, { id: 2, min: 11, max: 15, label: "De 11 a 15 m³", value: "8,65" }, { id: 3, min: 16, max: 25, label: "De 16 a 25 m³", value: "8,70" }, { id: 4, min: 26, max: 35, label: "De 26 a 35 m³", value: "11,53" }, { id: 5, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "11,92" }] },
    "Residencial Social Especial": { serviceRate: "9,16", tiers: [{ id: 1, min: 0, max: 15, label: "Até 15 m³", value: "0,26" }, { id: 2, min: 16, max: 25, label: "De 16 a 25 m³", value: "8,70" }, { id: 3, min: 26, max: 35, label: "De 26 a 35 m³", value: "11,53" }, { id: 4, min: 36, max: "Infinity", label: "Acima de 35 m³", value: "11,92" }] },
    "Comercial": { serviceRate: "50,90", tiers: [{ id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,73" }, { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "1,81" }, { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "10,50" }, { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "10,80" }, { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "10,95" }, { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "11,10" }] },
    "Comercial Entidade Beneficiente": { serviceRate: "25,45", tiers: [{ id: 1, min: 0, max: 5, label: "Até 5 m³", value: "0,85" }, { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "0,90" }, { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "5,25" }, { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "5,40" }, { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "5,45" }, { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "5,55" }] },
    "Industrial": { serviceRate: "50,90", tiers: [{ id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,73" }, { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "1,81" }, { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "10,50" }, { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "10,80" }, { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "10,95" }, { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "11,10" }] },
    "Pública": { serviceRate: "50,90", tiers: [{ id: 1, min: 0, max: 5, label: "Até 5 m³", value: "1,73" }, { id: 2, min: 6, max: 10, label: "De 6 a 10 m³", value: "1,81" }, { id: 3, min: 11, max: 15, label: "De 11 a 15 m³", value: "10,50" }, { id: 4, min: 16, max: 25, label: "De 16 a 25 m³", value: "10,80" }, { id: 5, min: 26, max: 50, label: "De 26 a 50 m³", value: "10,95" }, { id: 6, min: 51, max: "Infinity", label: "Acima de 50 m³", value: "11,10" }] }
  }
};

// ─── Tabela de Fator K1 (Esgoto) ───────────────────────────────────────────

export const K1_DATA: K1Item[] = [
  { category: "Residencial", activity: "Casa", k1: "1,00" },
  { category: "Residencial", activity: "Cond. Minha Casa Minha Vida", k1: "1,00" },
  { category: "Residencial", activity: "Condomínio Fechado", k1: "1,00" },
  { category: "Residencial", activity: "Consumo por Rateio", k1: "1,00" },
  { category: "Residencial", activity: "Prédio", k1: "1,00" },
  { category: "Residencial", activity: "Residencial - diversos, não especificados", k1: "1,00" },
  { category: "Comercial", activity: "Comercial - diversos, não especificados", k1: "1,00" },
  { category: "Comercial", activity: "Esporte", k1: "1,00" },
  { category: "Comercial", activity: "Lojas, Mini-mercado e pequenos comércios", k1: "1,00" },
  { category: "Comercial", activity: "Salão de Beleza/Barbearia/Estética", k1: "1,00" },
  { category: "Comercial", activity: "Hotel/Motel", k1: "1,03" },
  { category: "Comercial", activity: "Petshop/Veterinária/Agropecuária", k1: "1,11" },
  { category: "Comercial", activity: "Lavandeira", k1: "1,24" },
  { category: "Comercial", activity: "Lavação/Posto de Gasolina", k1: "1,53" },
  { category: "Comercial", activity: "Shopping/Centro Comercial", k1: "1,53" },
  { category: "Comercial", activity: "Bar/Restaurante/Espaço de Eventos", k1: "1,55" },
  { category: "Comercial", activity: "Mercado e Similares", k1: "1,65" },
  { category: "Industrial", activity: "Industrias - contribui somente esgoto doméstico", k1: "1,00" },
  { category: "Industrial", activity: "Industrias - diversos, não especificados", k1: "1,02" },
  { category: "Industrial", activity: "Ind. Borracha", k1: "1,10" },
  { category: "Industrial", activity: "Ind. Metal/Mecânica", k1: "1,10" },
  { category: "Industrial", activity: "Ind. Elétrica", k1: "1,14" },
  { category: "Industrial", activity: "Ind. Mineradora", k1: "1,15" },
  { category: "Industrial", activity: "Ind. Têxtil", k1: "1,19" },
  { category: "Industrial", activity: "Ind. Plástico", k1: "1,25" },
  { category: "Industrial", activity: "Condomínio Industrial", k1: "1,30" },
  { category: "Industrial", activity: "Ind. Química", k1: "1,35" },
  { category: "Industrial", activity: "Ind. Papel", k1: "1,45" },
  { category: "Industrial", activity: "Ind. Alimentos", k1: "1,55" },
  { category: "Industrial", activity: "Ind. Construção", k1: "1,68" },
  { category: "Industrial", activity: "Aterro Sanitário", k1: "1,68" },
  { category: "Público", activity: "Usos públicos (Hospitais, Escolas, Praças, etc)", k1: "1,00" },
  { category: "Público", activity: "Unidades prisionais com preparação de refeições", k1: "1,55" },
];