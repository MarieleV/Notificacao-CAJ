import { useState, useEffect, useRef } from "react";
import {
  ChevronDown, ChevronUp, Plus, Trash2,
  Calculator, ClipboardList, Info, AlertCircle, Droplets,
  FileText, Copy, CheckCircle2, RefreshCw, Lock, Search
} from "lucide-react";

// --- IMPORTAÇÕES DA NOVA ARQUITETURA ---
import { parseMonthYear, labelMonth } from "../lib/dates";
import { maskMonthYear, maskBRL, fmtBRL } from "../lib/masks";
import { DatePicker } from "./shared/DatePicker";
import { MonthYearPicker } from "./shared/MonthYearPicker";
import { MonthYearRangePicker } from "./shared/MonthYearRangePicker";
import { SectionBlock } from "./shared/SectionBlock";

// ─── Types ───────────────────────────────────────────────────────────────────

type IrregularRow = {
  id: number;
  monthYear: string;
  consumption: string;
  irregularConsumption: string;
  chargedWater: string;
  chargedService: string;
  chargedSewage: string;         
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

let uid = 1;
const newId = () => uid++;

// ─── Base de Dados Fixa (Somente Leitura) ────────────────────────────────────

const VIGENCIAS_AGUA = [
  "01/03/2025 Atual",
  "11/12/2024 a 28/02/2025",
  "01/03/2024 a 10/12/2024",
  "01/03/2023 a 29/02/2024"
];

const VIGENCIAS_K1 = [
  "15/07/2025 Atual",
  "20/01/2023 a 14/07/2025"
];

// Matriz de Tarifas por Vigência
const TARIFF_DATA: Record<string, Record<string, { serviceRate: string, tiers: any[] }>> = {
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

const K1_DATA = [
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


// ─── Main Component ───────────────────────────────────────────────────────────

export function FineCalculator() {
  const [configOpen, setConfigOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setConfigOpen(false);
      }
    }
    if (configOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [configOpen]);

  // Estados de Configuração (Água)
  const [selectedVigenciaAgua, setSelectedVigenciaAgua] = useState(VIGENCIAS_AGUA[0]);
  const [selectedTariff, setSelectedTariff] = useState("Residencial");

  // Estados de Configuração (Esgoto)
  const [selectedVigenciaK1, setSelectedVigenciaK1] = useState(VIGENCIAS_K1[0]);
  const [selectedK1Category, setSelectedK1Category] = useState("Residencial");
  const [selectedK1Activity, setSelectedK1Activity] = useState("Casa");

  // Estado das Linhas
  const [rows, setRows] = useState<IrregularRow[]>([
    { 
      id: newId(), monthYear: "01/2026", consumption: "20",
      irregularConsumption: "",
      chargedWater: "13,60", chargedService: "31,96", 
      chargedSewage: ""
    },
  ]);

  // Gerador de período (Range Picker)
  const [periodRange, setPeriodRange] = useState("");

  // Campos complementares do texto
  const [aiNumber, setAiNumber] = useState("");
  const [removalDate, setRemovalDate] = useState("");
  const [postRegM3, setPostRegM3] = useState("");
  const [postRegRef, setPostRegRef] = useState("");
  const [billedM3, setBilledM3] = useState("");
  
  const [waterReportText, setWaterReportText] = useState("");
  const [sewageReportText, setSewageReportText] = useState("");
  const [copiedWater, setCopiedWater] = useState(false);
  const [copiedSewage, setCopiedSewage] = useState(false);

  // ─── Derivando os parâmetros baseados nas seleções ──────────────────────────
  
  const currentTariffData = TARIFF_DATA[selectedVigenciaAgua]?.[selectedTariff] || { serviceRate: "0,00", tiers: [] };
  const currentK1Data = K1_DATA.find(i => i.activity === selectedK1Activity && i.category === selectedK1Category);
  const k1Factor = currentK1Data ? currentK1Data.k1 : "1,00";

  function handleTariffChange(tariffName: string) {
    setSelectedTariff(tariffName);
    
    let k1Cat = "Residencial";
    if (tariffName.includes("Comercial")) k1Cat = "Comercial";
    else if (tariffName.includes("Industrial")) k1Cat = "Industrial";
    else if (tariffName.includes("Pública")) k1Cat = "Público";

    setSelectedK1Category(k1Cat);
    const firstActivity = K1_DATA.find(item => item.category === k1Cat);
    if (firstActivity) {
      setSelectedK1Activity(firstActivity.activity);
    }
  }

  function handleK1ActivityChange(activity: string) {
    setSelectedK1Activity(activity);
  }

  // ─── Handlers de Linhas Irregulares ──────────────────────────────────────

  function addRow() {
    setRows((p) => [...p, { 
      id: newId(), monthYear: "", consumption: "",
      irregularConsumption: "",
      chargedWater: "", chargedService: "",
      chargedSewage: ""
    }]);
  }

  function handleGeneratePeriod(rangeVal: string) {
    if (!rangeVal) return;

    // O Range Picker agora devolve "MM/AAAA a MM/AAAA"
    const parts = rangeVal.split(" a ");
    const start = parseMonthYear(parts[0]);
    const end = parts.length > 1 ? parseMonthYear(parts[1]) : start;

    if (!start || !end || start > end) return;

    const generatedRows: IrregularRow[] = [];
    let current = new Date(start);

    while (current <= end) {
      const mm = String(current.getMonth() + 1).padStart(2, "0");
      const yyyy = current.getFullYear();
      const monthYearStr = `${mm}/${yyyy}`;

      generatedRows.push({
        id: newId(),
        monthYear: monthYearStr,
        consumption: "",
        irregularConsumption: "",
        chargedWater: "",
        chargedService: "",
        chargedSewage: ""
      });

      current.setMonth(current.getMonth() + 1);
    }

    setRows((prev) => {
      const existingMonths = prev.map(r => r.monthYear);
      const filteredRows = generatedRows.filter(r => !existingMonths.includes(r.monthYear));
      return [...prev, ...filteredRows];
    });
  }

  function removeRow(id: number) {
    setRows((p) => p.filter((r) => r.id !== id));
  }

  const AUTOFILL_FIELDS: (keyof IrregularRow)[] = [
    "consumption",
    "irregularConsumption",
    "chargedWater",
    "chargedService",
    "chargedSewage",
  ];

  function changeRow(id: number, field: keyof IrregularRow, val: string) {
    setRows((p) =>
      p.map((r) => {
        if (r.id !== id) return r;
        if (field === "monthYear") return { ...r, monthYear: maskMonthYear(val) };
        if (field === "consumption") return { ...r, consumption: val.replace(/[^0-9,]/g, "") };
        if (field === "irregularConsumption") return { ...r, irregularConsumption: val.replace(/[^0-9,]/g, "") };
        if (["chargedWater", "chargedService", "chargedSewage"].includes(field)) {
          return { ...r, [field]: maskBRL(val) };
        }
        return r;
      })
    );
  }

  function cascadeFillFromFirstRow(field: keyof IrregularRow) {
    if (!AUTOFILL_FIELDS.includes(field)) return;
    setRows((p) => {
      if (p.length === 0) return p;
      const value = (p[0] as any)[field] as string;
      if (!value) return p;
      return p.map((r, i) => {
        if (i === 0) return r;
        if ((r as any)[field] === "") {
          return { ...r, [field]: value };
        }
        return r;
      });
    });
  }

  // ─── Integração com Back-end ──────────────────────────────────────────────
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    const delay = setTimeout(() => fetchCalculations(), 600);
    return () => clearTimeout(delay);
  }, [selectedVigenciaAgua, selectedTariff, rows, k1Factor, aiNumber, removalDate, postRegM3, postRegRef, billedM3]);

  async function fetchCalculations() {
    try {
      const formattedSewageRows = rows.map(r => ({
        id: r.id,
        monthYear: r.monthYear,
        chargedSewage: r.chargedSewage,
        chargedService: "0" 
      }));

      const payloadServiceRates = [
        { id: 1, startMonth: "01/1900", endMonth: "12/2099", value: currentTariffData.serviceRate }
      ];

      const response = await fetch("https://notificacao-caj.vercel.app/api/calcular_multa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          serviceRates: payloadServiceRates, 
          m3Tiers: currentTariffData.tiers, 
          rows, 
          sewageRows: formattedSewageRows, 
          k1Factor, aiNumber, removalDate, postRegM3, postRegRef, billedM3 
        })
      });
      const data = await response.json();
      setApiData(data);
    } catch (error) {
      console.error("Erro na API:", error);
    }
  }

  // ─── Pontes Seguras ───────────────────────────────────────────────────────
  
  const calcRows = rows.map((row) => {
    const apiCalc = apiData?.rows?.find((r: any) => r.id === row.id);
    if (apiCalc) return { ...apiCalc, row };
    
    return {
      row, hasError: false, consumption: 0, correctWater: null, correctService: null,
      totalCorrect: null, chargedWater: 0, chargedService: 0, totalCharged: 0, diff: null, m3Rate: null
    };
  });

  const validRows = calcRows.filter((r: any) => !r.hasError && r.totalCorrect !== null);
  const totalM3 = apiData?.totals?.totalM3 || 0;
  const grandCorrect = apiData?.totals?.grandCorrect || 0;
  const grandCharged = apiData?.totals?.grandCharged || 0;
  const grandDiff = apiData?.totals?.grandDiff || 0;

  function handleGenerateText() {
    if (apiData?.waterReportText) setWaterReportText(apiData.waterReportText);
    if (apiData?.sewageReportText) {
      setSewageReportText(apiData.sewageReportText);
    } else {
      setSewageReportText(""); 
    }
  }

  function handleCopy(text: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) {
    if (!text) return;
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    } catch {}
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="relative bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0 shadow-sm z-50">
        <div>
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-[#1a5fa8]" />
            <h1 className="text-[#0b1e35] font-semibold text-lg">Cálculo de Consumo Irregular</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Apuração do valor correto vs. cobrado antes da regularização
          </p>
        </div>
        
        <div ref={panelRef} className="relative">
          <button
            onClick={() => setConfigOpen((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
              configOpen 
                ? "bg-[#eef6ff] border-[#1a5fa8] text-[#1a5fa8]"
                : "bg-white border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] shadow-sm"
            }`}
          >
            <Search size={15} className="mr-1" />
            Parâmetros de Cálculo
            {configOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {configOpen && (
            <div className="absolute top-full right-0 mt-3 w-full sm:min-w-[550px] max-w-xl bg-white border border-gray-200 rounded-xl shadow-2xl cursor-default origin-top-right z-50 flex flex-col max-h-[80vh]">
              
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                <div>
                  <h2 className="text-[#0b1e35] font-bold text-base flex items-center gap-2">
                    <Lock size={16} className="text-[#1a5fa8]" /> Parâmetros Oficiais de Cálculo
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">
                    Selecione a vigência e a categoria aplicável.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-5 px-6 py-5 overflow-y-auto">
                
                {/* ── BLOCO 1: ÁGUA ── */}
                <div className="bg-[#f8fafe] p-4 rounded-xl border border-[#dce9f7]">
                  <div className="flex items-center gap-2 border-b border-[#c3ddf8] pb-2 mb-3">
                    <Droplets size={15} className="text-[#1a5fa8]" />
                    <h3 className="text-xs font-bold text-[#1a5fa8] uppercase tracking-wider">1. Tarifas de Água</h3>
                  </div>
                  
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Vigência (ARIS)</label>
                      <select
                        value={selectedVigenciaAgua}
                        onChange={(e) => setSelectedVigenciaAgua(e.target.value)}
                        className="w-36 px-2 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 bg-white cursor-pointer transition-all"
                      >
                        {VIGENCIAS_AGUA.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Categoria da Matrícula</label>
                      <select
                        value={selectedTariff}
                        onChange={(e) => handleTariffChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 bg-white cursor-pointer transition-all"
                      >
                        {Object.keys(TARIFF_DATA[VIGENCIAS_AGUA[0]]).map((key) => (
                          <option key={key} value={key}>{key}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center bg-[#eef6ff] px-4 py-2 border-b border-gray-200">
                      <span className="text-xs font-bold text-[#0b1e35] uppercase tracking-wider">Tarifa Fixa Mensal</span>
                      <span className="text-sm font-bold text-[#1a5fa8]">R$ {currentTariffData.serviceRate}</span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {currentTariffData.tiers.map((tier) => (
                        <li key={tier.id} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 transition-colors">
                          <span className="text-xs font-medium text-gray-600">{tier.label}</span>
                          <span className="text-xs font-bold text-[#1a5fa8]">R$ {tier.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ── BLOCO 2: ESGOTO (K1) ── */}
                <div className="bg-[#f8fafe] p-4 rounded-xl border border-[#dce9f7]">
                  <div className="flex items-center gap-2 border-b border-[#c3ddf8] pb-2 mb-3">
                    <Info size={15} className="text-[#1a5fa8]" />
                    <h3 className="text-xs font-bold text-[#1a5fa8] uppercase tracking-wider">2. Fator de Esgoto - K1</h3>
                  </div>

                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center justify-between gap-3">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Vigência (ARIS)</label>
                      <select
                        value={selectedVigenciaK1}
                        onChange={(e) => setSelectedVigenciaK1(e.target.value)}
                        className="w-36 px-2 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 bg-white cursor-pointer transition-all"
                      >
                        {VIGENCIAS_K1.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ramo de Atividade (K1)</label>
                      <select
                        value={selectedK1Activity}
                        onChange={(e) => handleK1ActivityChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 bg-white cursor-pointer transition-all"
                      >
                        {K1_DATA.filter(item => item.category === selectedK1Category).map(item => (
                          <option key={item.activity} value={item.activity}>{item.activity}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-xs font-bold text-[#0b1e35] uppercase tracking-wider">Fator Multiplicador (K1)</span>
                    <span className="text-sm font-bold text-[#1a5fa8]">{k1Factor}</span>
                  </div>
                    <div className="mt-4 bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-4 py-3 flex items-start gap-2">
                    <Info size={13} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-[#4a7fa5]">
                        <strong>Fator K1</strong> - Fator de Carga Poluidora para lançamentos na rede pública de esgotos.
                      </p>
                    </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#f8fafe]">
        <div className="p-8 max-w-5xl mx-auto space-y-8 w-full">

          {/* ── Bloco 1: Lançamento Água ───────────────────────────────────── */}
          <SectionBlock
            number={1}
            title="Lançamento dos Meses Irregulares de Água"
            description="Gere um período automático ou adicione mês a mês"
            headerAction={
              <div className="w-full max-w-[240px]">
                <MonthYearRangePicker 
                  value={periodRange} 
                  onChange={(val) => {
                    setPeriodRange(val);
                    if (val) handleGeneratePeriod(val); 
                  }} 
                  placeholder="Adicione um período..." 
                />
              </div>
            }
          >
            <div className="grid grid-cols-[130px_1fr_1fr_1fr_1fr_40px] gap-3 mb-2 px-1">
              {[
                "Mês/Ano",
                "Consumo Regular (m³)",
                "Consumo Irregular (m³)",
                "Água Cobrada Errada (R$)",
                "Serviço Cobrado Errado (R$)",
                ""
              ].map((h, i) => (
                <div key={i} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</div>
              ))}
            </div>

            <div className="space-y-2">
              {rows.map((row, idx) => {
                const calc = calcRows[idx];
                const dateError = row.monthYear.length === 7 && !parseMonthYear(row.monthYear);
                const noRate = row.monthYear.length === 7 && parseMonthYear(row.monthYear) && calc.hasError;

                return (
                  <div key={row.id}>
                    <div className="grid grid-cols-[130px_1fr_1fr_1fr_1fr_40px] gap-3 items-center">
                      <input
                        value={row.monthYear}
                        onChange={(e) => changeRow(row.id, "monthYear", e.target.value)}
                        placeholder="MM/AAAA"
                        maxLength={7}
                        className={`w-full px-2.5 py-2 border rounded-lg text-xs focus:outline-none focus:ring-1 transition-all ${
                          dateError
                            ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200"
                            : "border-gray-200 focus:border-[#1a5fa8] focus:ring-[#1a5fa8]/20"
                        }`}
                      />
                      <input
                        value={row.consumption}
                        onChange={(e) => changeRow(row.id, "consumption", e.target.value)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("consumption")}
                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                        placeholder="Ex: 20"
                        className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                      />
                      <input
                        value={row.irregularConsumption}
                        onChange={(e) => changeRow(row.id, "irregularConsumption", e.target.value)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("irregularConsumption")}
                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                        placeholder="Ex: 15"
                        className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                      />
                      <input
                        value={row.chargedWater}
                        onChange={(e) => changeRow(row.id, "chargedWater", e.target.value)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("chargedWater")}
                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                        placeholder="Ex: 13,60"
                        className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                      />
                      <input
                        value={row.chargedService}
                        onChange={(e) => changeRow(row.id, "chargedService", e.target.value)}
                        onBlur={() => idx === 0 && cascadeFillFromFirstRow("chargedService")}
                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                        placeholder="Ex: 31,96"
                        className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                      />
                      <button
                        onClick={() => removeRow(row.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors justify-self-center"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {noRate && (
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-600 px-1">
                        <AlertCircle size={10} /> Verifique a vigência selecionada nos Parâmetros.
                      </div>
                    )}
                    {dateError && (
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-red-500 px-1">
                        <AlertCircle size={10} /> Formato inválido. Use MM/AAAA (ex: 01/2026).
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {rows.length === 0 && (
              <div className="py-8 text-center text-gray-300 text-sm">
                Utilize o gerador de período acima ou clique abaixo para adicionar manualmente.
              </div>
            )}

            <div className="mt-4 flex justify-center">
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 text-xs text-[#1a5fa8] hover:text-[#154d8a] font-medium transition-colors"
              >
                <Plus size={12} /> Adicionar mês avulso manualmente
              </button>
            </div>
            <div className="mt-4 bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-4 py-3 flex items-start gap-2">
              <Info size={13} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#4a7fa5]">
                Preencha a <strong>1ª linha</strong> e os valores se repetirão nas linhas vazias abaixo - <strong>você pode editar</strong> qualquer uma <strong>individualmente</strong>, se necessário.
              </p>
            </div>
          </SectionBlock>

          {/* ── Bloco 2: Lançamento Esgoto ───────────────────────────────────── */}
          <SectionBlock
            number={2}
            title="Lançamento dos Meses Irregulares de Esgoto"
            description="Sincronizado automaticamente com a tabela de Água"
          >
            <div className="grid grid-cols-[140px_200px] gap-4 mb-2 px-1">
              {["Mês/Ano (Automático)", "Esgoto Cobrado Errado (R$)"].map((h, i) => (
                <div key={i} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</div>
              ))}
            </div>

            <div className="space-y-2">
              {rows.map((row, idx) => (
                <div key={row.id}>
                  <div className="grid grid-cols-[140px_200px] gap-4 items-center">
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-500 flex items-center h-[34px]">
                      {row.monthYear || "Mês não preenchido"}
                    </div>
                    <input
                      value={row.chargedSewage}
                      onChange={(e) => changeRow(row.id, "chargedSewage", e.target.value)}
                      onBlur={() => idx === 0 && cascadeFillFromFirstRow("chargedSewage")}
                      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                      placeholder="Ex: 10,88"
                      className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:border-[#1a5fa8] focus:outline-none focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all h-[34px]"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {rows.length === 0 && (
              <div className="py-6 text-center text-gray-300 text-sm">
                Adicione meses na tabela de Água primeiro.
              </div>
            )}

            <div className="mt-4 bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-4 py-3 flex items-start gap-2">
              <Info size={13} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#4a7fa5]">
                A tarifa referente ao esgotamento sanitário corresponde à <strong>80% do valor da fatura de água</strong> multiplicado pelo <strong>Fator K1</strong>.
              </p>
            </div>
          </SectionBlock>

          {/* ── Bloco 3: Tabela de Resultados ─────────────────────────────────── */}
          <SectionBlock
            number={3}
            title="Resultado Detalhado por Mês"
            description="Gerado automaticamente pelo motor de cálculo"
          >
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafe] border-y border-gray-100">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider leading-tight">Mês<br/>Irregular</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider leading-tight">Consumo<br/>(m³)</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-[#1a5fa8] uppercase tracking-wider bg-[#eef6ff] leading-tight border-l border-white">Valor Água<br/>(Correto)</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-[#1a5fa8] uppercase tracking-wider bg-[#eef6ff] leading-tight">Serviço<br/>(Correto)</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-[#1a5fa8] uppercase tracking-wider bg-[#eef6ff] leading-tight border-r border-white">Total<br/>Correto</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-red-500 uppercase tracking-wider bg-red-50 leading-tight">Água Cobrada<br/>(Errado)</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-red-500 uppercase tracking-wider bg-red-50 leading-tight">Serv. Cobrado<br/>(Errado)</th>
                    <th className="px-3 py-3 text-right text-[11px] font-semibold text-red-500 uppercase tracking-wider bg-red-50 leading-tight border-r border-white">Total<br/>Errado</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-600 uppercase tracking-wider leading-tight">Diferença</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {calcRows.map((c) => {
                    if (c.hasError) {
                      return (
                        <tr key={c.row.id} className="bg-amber-50/40">
                          <td className="px-6 py-3 text-gray-500 text-xs italic">
                            {c.row.monthYear || "—"}
                          </td>
                          <td colSpan={8} className="px-6 py-3 text-xs text-amber-600 italic">
                            <div className="flex items-center gap-1.5">
                              <AlertCircle size={11} />
                              Aguardando dados completos.
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    const positive = (c.diff ?? 0) >= 0;
                    return (
                      <tr key={c.row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-medium text-[#0b1e35] whitespace-nowrap">
                          {labelMonth(c.row.monthYear)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-gray-700">
                          {c.consumption} m³
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-[#1a5fa8] font-medium bg-[#eef6ff]/40">
                          {c.correctWater !== null ? fmtBRL(c.correctWater) : "—"}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-[#1a5fa8] font-medium bg-[#eef6ff]/40">
                          {c.correctService !== null ? fmtBRL(c.correctService) : "—"}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums font-bold text-[#1a5fa8] bg-[#eef6ff]/40">
                          {c.totalCorrect !== null ? fmtBRL(c.totalCorrect) : "—"}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-red-600 bg-red-50/30">
                          {fmtBRL(c.chargedWater)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-red-600 bg-red-50/30">
                          {fmtBRL(c.chargedService)}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums font-bold text-red-600 bg-red-50/30">
                          {fmtBRL(c.totalCharged)}
                        </td>
                        <td className={`px-6 py-3 text-right tabular-nums font-bold ${positive ? "text-emerald-600" : "text-red-600"}`}>
                          {c.diff !== null ? fmtBRL(c.diff) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-6 py-10 text-center text-gray-300 text-sm">
                        Nenhum dado para exibir.
                      </td>
                    </tr>
                  )}
                </tbody>
                {validRows.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-[#f8fafe]">
                      <td className="px-6 py-3 text-xs font-bold text-gray-600 uppercase">TOTAIS</td>
                      <td className="px-3 py-3 text-right tabular-nums text-xs font-bold text-gray-700">{totalM3} m³</td>
                      <td colSpan={2} className="bg-[#eef6ff]/60"></td>
                      <td className="px-3 py-3 text-right tabular-nums text-sm font-bold text-[#1a5fa8] bg-[#eef6ff]/60">{fmtBRL(grandCorrect)}</td>
                      <td colSpan={2} className="bg-red-50/40"></td>
                      <td className="px-3 py-3 text-right tabular-nums text-sm font-bold text-red-600 bg-red-50/40">{fmtBRL(grandCharged)}</td>
                      <td className={`px-6 py-3 text-right tabular-nums text-sm font-bold ${grandDiff >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {fmtBRL(grandDiff)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </SectionBlock>

          {/* ── Bloco 4: Painel de KPIs ───────────────────────────────────────── */}
          <SectionBlock
            number={4}
            title="Painel de Resumo - Correspondente aos Meses de Irregularidade"
            description="Base para lançamento financeiro ou notificação extrajudicial"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-gray-100 bg-[#f8fafe] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets size={14} className="text-[#1a5fa8]" />
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Total de m³</p>
                </div>
                <p className="text-2xl font-bold text-[#0b1e35] tabular-nums">{totalM3}</p>
                <p className="text-[10px] text-gray-400 mt-1">metros cúbicos irregulares</p>
              </div>

              <div className="rounded-xl border border-[#c3ddf8] bg-[#eef6ff] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator size={14} className="text-[#1a5fa8]" />
                  <p className="text-[10px] font-semibold text-[#1a5fa8] uppercase tracking-wider">Valor Correto</p>
                </div>
                <p className="text-2xl font-bold text-[#1a5fa8] tabular-nums">{fmtBRL(grandCorrect)}</p>
                <p className="text-[10px] text-[#4a7fa5] mt-1">o que deveria ser cobrado</p>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={14} className="text-red-500" />
                  <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">Cobrado (Errado)</p>
                </div>
                <p className="text-2xl font-bold text-red-600 tabular-nums">{fmtBRL(grandCharged)}</p>
                <p className="text-[10px] text-red-400 mt-1">antes da regularização</p>
              </div>

              <div className={`rounded-xl border p-4 ${grandDiff >= 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList size={14} className={grandDiff >= 0 ? "text-emerald-600" : "text-red-500"} />
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${grandDiff >= 0 ? "text-emerald-700" : "text-red-500"}`}>
                    Diferença a Lançar
                  </p>
                </div>
                <p className={`text-2xl font-bold tabular-nums ${grandDiff >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                  {fmtBRL(Math.abs(grandDiff))}
                </p>
                <p className={`text-[10px] mt-1 ${grandDiff >= 0 ? "text-emerald-600" : "text-red-400"}`}>
                  {grandDiff >= 0 ? "a cobrar do cliente" : "cobrado a mais do cliente"}
                </p>
              </div>
            </div>

            {validRows.length > 0 && (
              <div className="mt-4 bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-4 py-3 flex items-start gap-2">
                <Info size={13} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#4a7fa5]">
                  <strong>Resumo:</strong> Nos {validRows.length} meses de irregularidade apurados,
                  o valor correto total seria de <strong>{fmtBRL(grandCorrect)}</strong>,
                  porém foi cobrado apenas <strong>{fmtBRL(grandCharged)}</strong>.
                  A diferença de <strong>{fmtBRL(Math.abs(grandDiff))}</strong> representa o ajuste financeiro a ser lançado
                  referente ao consumo irregular de <strong>{totalM3} m³</strong>.
                </p>
              </div>
            )}
          </SectionBlock>

          {/* ── Bloco 5: Texto de Apuração ───────────────────────────────────── */}
          <SectionBlock
            number={5}
            title="Texto de Apuração"
            description="Gerado com base nos cálculos - editável e copiável"
          >
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-3">Dados complementares para o texto</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Número do AI
                    </label>
                    <input
                      value={aiNumber}
                      onChange={(e) => setAiNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="Ex: 14036735"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Data de Retirada da Irregularidade
                    </label>
                    <DatePicker
                      value={removalDate}
                      onChange={setRemovalDate}
                      placeholder="DD/MM/AAAA"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Maior Consumo Pós-Reg. (m³)
                    </label>
                    <input
                      value={postRegM3}
                      onChange={(e) => setPostRegM3(e.target.value.replace(/\D/g, ""))}
                      placeholder="Ex: 49"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Mês de Ref. Pós-Reg.
                    </label>
                    <MonthYearPicker
                      value={postRegRef}
                      onChange={setPostRegRef}
                      placeholder="MM/AAAA"
                      size="md"
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Vol. Faturado no Mês do Corte (m³)
                    </label>
                    <input
                      value={billedM3}
                      onChange={(e) => setBilledM3(e.target.value.replace(/\D/g, ""))}
                      placeholder="Ex: 20"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8]/20 transition-all"
                    />
                  </div>
                  <div className="sm:col-span-3 flex flex-col justify-end">
                    <div className="bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-3 py-2 flex items-start gap-2">
                      <Info size={12} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
                      <p className="text-[11px] text-[#4a7fa5]">
                        Os valores de <strong>período</strong>, <strong>valor correto</strong>, <strong>valor cobrado</strong>,
                        <strong> diferença</strong> e <strong>volume total recuperado</strong> são preenchidos automaticamente
                        a partir dos cálculos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateText}
                  disabled={validRows.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-all shadow"
                >
                  <RefreshCw size={14} />
                  Gerar Texto
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Laudo da Água */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-600">Laudo de Água</label>
                    <button
                      onClick={() => handleCopy(waterReportText, setCopiedWater)}
                      disabled={!waterReportText}
                      className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-all"
                    >
                      {copiedWater ? (
                        <><CheckCircle2 size={13} className="text-emerald-500" /><span className="text-emerald-600">Copiado!</span></>
                      ) : (
                        <><Copy size={13} /> Copiar Água</>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={waterReportText}
                    onChange={(e) => setWaterReportText(e.target.value)}
                    placeholder={
                      validRows.length === 0
                        ? "Adicione os meses irregulares e clique em [Gerar Texto]..."
                        : "Texto da Água aparecerá aqui."
                    }
                    rows={10}
                    className="w-full px-4 py-3 bg-[#fafbfc] border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all font-mono"
                    spellCheck={false}
                  />
                </div>

                {/* Laudo do Esgoto */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-600">Laudo de Esgoto</label>
                    <button
                      onClick={() => handleCopy(sewageReportText, setCopiedSewage)}
                      disabled={!sewageReportText}
                      className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] disabled:border-gray-200 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg text-xs font-semibold transition-all"
                    >
                      {copiedSewage ? (
                        <><CheckCircle2 size={13} className="text-emerald-500" /><span className="text-emerald-600">Copiado!</span></>
                      ) : (
                        <><Copy size={13} /> Copiar Esgoto</>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={sewageReportText}
                    onChange={(e) => setSewageReportText(e.target.value)}
                    placeholder={
                      validRows.length === 0
                        ? "Adicione os meses irregulares e clique em [Gerar Texto]..."
                        : "Texto do Esgoto aparecerá aqui caso existam valores informados."
                    }
                    rows={10}
                    className="w-full px-4 py-3 bg-[#fafbfc] border border-gray-200 rounded-xl text-sm text-gray-800 leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all font-mono"
                    spellCheck={false}
                  />
                </div>
              </div>
              
              <p className="mt-1.5 text-[11px] text-gray-400 flex items-center gap-1.5">
                <Info size={11} />
                Clique dentro de qualquer um dos textos para editar manualmente antes de copiar.
              </p>
            </div>
          </SectionBlock>

        </div>
      </div>
    </div>
  );
}