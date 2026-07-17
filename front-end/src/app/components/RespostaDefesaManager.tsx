import { useState, useRef } from "react";
import {
  Copy, Download, CheckCircle2, AlertCircle,
  ChevronDown, X, FileText, Search, Scale, Calculator
} from "lucide-react";
import { calculateEndDate } from "../lib/dates";
import { DatePicker } from "./shared/DatePicker";
import { SectionBlock } from "./shared/SectionBlock";

// === BASE DE DADOS DOS TEXTOS PREDEFINIDOS ===
const DEFESAS_TEMPLATES = [
  {
    code: "20400",
    title: "Intervenção na rede e equipamentos água/esgoto da CIA",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso I, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em intervenção nas instalações dos sistemas públicos de abastecimento de água e esgotamento sanitário, quando estas possam afetar a eficiência dos serviços, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ 480,40;\n\n- Multa por intervenção nas instalações dos sistemas públicos de abastecimento de água e esgotamento sanitário que possam afetar a eficiência dos serviços, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "infraestrutura",
  },
  {
    code: "20401",
    title: "Desperdício de Água",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XIII, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em desperdício de água em períodos oficiais de racionamento, quando estas possam afetar a eficiência dos serviços, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por Desperdício de água em períodos oficiais de racionamento, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "uso",
  },
  {
    code: "20402",
    title: "Violação do lacre cavalete e/ou hidrômetro",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XV, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em violação do lacre de proteção do cavalete e do hidrômetro, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão]. Entretanto, caso usuário padronize a ligação de água dentro do prazo de 90 (noventa) dias, contados a partir da data de recebimento do Auto de Infração, não será aplicado multa.\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por violação do lacre de proteção do cavalete e do hidrômetro, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "fraude",
  },
  {
    code: "20403",
    title: "Violação do corte ramal",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XXII, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em restabelecimento irregular do abastecimento de água em ligações cortadas no ramal, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por restabelecimento irregular do abastecimento de água em ligações cortadas no ramal, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "fraude",
  },
  {
    code: "20404",
    title: "Ligação clandestina de água e esgoto",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso VII, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em ligação clandestina de água e esgoto, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nPenalidades mantidas:\n\n- Multa por ligação clandestina de água e esgoto, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "fraude",
  },
  {
    code: "20405",
    title: "Inversão/Danificação ou Retirada do Hidrômetro",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso VI, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em danificação propositada, inversão ou supressão do hidrômetro, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por danificação propositada, inversão ou supressão do hidrômetro, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "fraude",
  },
  {
    code: "20406",
    title: "Intervenção no cavalete sem consentimento da CAJ",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XXI, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em Intervenção no cavalete sem o consentimento do prestador de serviços, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa pela infração cometida, juntamente com a multa por não padronização.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por intervenção no cavalete sem o consentimento do prestador de serviços no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "infraestrutura",
  },
  {
    code: "20407",
    title: "Interligação ligação água com outra fonte alternativa",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso II, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em instalação hidráulica predial de água ligada à rede pública e interligada com abastecimento de água alimentada por outras fontes, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por instalação hidráulica predial de água ligada à rede pública e interligada com abastecimento de água alimentada por outras fontes, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "infraestrutura",
  },
  {
    code: "20408",
    title: "Cessão de água entre imóveis",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XI, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em interligação de instalações prediais de água, entre imóveis distintos com ou sem débito, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa interligação de instalações prediais de água, entre imóveis distintos com ou sem débito, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "uso",
  },
  {
    code: "20409",
    title: "Inst. de bombas ou dispositivos na rede e/ou ramal predial",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso VIII, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em instalação de bomba ou quaisquer dispositivos no ramal predial ou na rede de distribuição, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa instalação de bomba ou quaisquer dispositivos no ramal predial ou na rede de distribuição, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "infraestrutura",
  },
  {
    code: "20410",
    title: "Impedimento voluntário de acesso a ligação de água e esgoto",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme a Resolução nº 19/2019 da ARIS, em seu Art. 69, toda unidade usuária deverá assegurar ao prestador de serviços o livre acesso para instalação, vistoria, manutenção, corte e leitura.\nNos termos do Art. 144, inciso XII, da mesma resolução, constitui infração o impedimento voluntário à promoção da leitura do hidrômetro ou à execução de serviços de manutenção do cavalete, hidrômetro e caixa de inspeção de esgoto pela prestadora de serviços.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nFica estabelecido que, caso o usuário realize a padronização da ligação de água dentro do prazo estipulado no auto de infração, não haverá aplicação da multa. Contudo, caso não cumpra a obrigatoriedade de padronização, serão aplicadas as seguintes penalidades:\nPenalidades mantidas:\n\n- Multa por impedimento voluntário: R$ XXX,XX;\n\n- Multa por não execução da padronização obrigatória: R$ XXX,XX.`,
    category: "acesso",
  },
  {
    code: "20411",
    title: "Intervenção no ramal e/ou deslocamento s/consentimento",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XXI, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em Intervenção e/ou deslocamento de ramal/cavalete sem o consentimento do prestador de serviços, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por intervenção e/ou deslocamento de ramal/cavalete sem o consentimento do prestador de serviços, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "infraestrutura",
  },
  {
    code: "20412",
    title: "Utilização indevida do hidrante instalado no imóvel",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XVI, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em utilização indevida do hidrante instalado na área interna do imóvel, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por utilização indevida do hidrante instalado na área interna do imóvel, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "uso",
  },
  {
    code: "20413",
    title: "Instalação de aparelhos supressores de ar",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XIX, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em instalação de aparelhos supressores de ar, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa instalação de aparelhos supressores de ar, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "infraestrutura",
  },
  {
    code: "20414",
    title: "Derivação não autorizada antes do hidrômetro (by-pass)",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso V, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em derivação do ramal predial antes do hidrômetro (by pass), sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por derivação do ramal predial antes do hidrômetro (by pass), no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "fraude",
  },
  {
    code: "20415",
    title: "Ausência de caixa de proteção do cavalete e hidrômetro",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XVIII, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em ausência de abrigo ou caixa de proteção do cavalete e hidrômetro, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por ausência de abrigo ou caixa de proteção do cavalete e hidrômetro, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "infraestrutura",
  },
  {
    code: "20416",
    title: "Violação do corte cavalete",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso X, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em estabelecimento irregular do abastecimento de água em ligações cortadas no cavalete, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa restabelecimento irregular do abastecimento de água em ligações cortadas no cavalete, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "fraude",
  },
  {
    code: "20417",
    title: "Impedimento involuntário de acesso a ligação de água e esgoto",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme a Resolução nº 19/2019 da ARIS, em seu Art. 69, toda unidade usuária deverá assegurar ao prestador de serviços o livre acesso para instalação, vistoria, manutenção, corte e leitura.\nNos termos do Art. 144, inciso XII, da mesma resolução, constitui infração o impedimento involuntário à promoção da leitura do hidrômetro ou à execução de serviços de manutenção do cavalete, hidrômetro e caixa de inspeção de esgoto pela prestadora de serviços.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nFica estabelecido que, caso o usuário realize a padronização da ligação de água dentro do prazo estipulado no auto de infração, não haverá aplicação da multa. Contudo, caso não cumpra a obrigatoriedade de padronização, serão aplicadas as seguintes penalidades:\nPenalidades mantidas:\n\n- Multa por impedimento involuntário: R$ XXX,XX;\n\n- Multa por não execução da padronização obrigatória: R$ XXX,XX.`,
    category: "acesso",
  },
  {
    code: "20418",
    title: "Violação do lacre da porta caixa ou cubículo de proteção",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XV, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em violação do lacre da porta caixa ou cubículo de proteção do hidrômetro, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nPenalidades mantidas:\n\n- Multa Violação do lacre da porta caixa ou cubículo de proteção do hidrômetro, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "fraude",
  },
  {
    code: "20419",
    title: "Atualização Cadastral",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e deferida parcialmente.\nConforme disposto no art. 48, inciso VI, da Norma de Referência ANA nº 11/2024, cabe ao titular do serviço público de saneamento básico estabelecer a responsabilidade dos usuários quanto à atualização cadastral, sendo dever do próprio usuário manter suas informações atualizadas junto ao Prestador de Serviços. Notificamos V.Sa. e identificamos que seu cadastro ainda não foi atualizado.\nPenalidades mantidas:\n\n- Multa Recusa voluntaria de atualização de dados cadastrais, no valor de R$ 480,80;`,
    category: "cadastral",
  },
  {
    code: "Prazo",
    title: "Impedimento para execução de serviços",
    text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e deferida parcialmente.\nConforme a Resolução nº 19/2019 da ARIS, Art. 144, §3º, O prestador de serviço pode solicitar a padronização obrigatória da ligação de água para qualquer infração cometida, além da aplicação de multa, se for o caso.\nNos termos do Art. 144, inciso $$$$$$$$$$$, da mesma resolução, constitui infração XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.\nMotivo do deferimento parcial: [descrever aqui o fundamento específico para a decisão].\nDiante disso, acata-se a extensão do prazo de/em XX dias para a realização da padronização da ligação, com vencimento em XX/XX/XXXX. Após esse prazo, ficará sujeita à aplicação das seguintes penalidades:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
    category: "infraestrutura",
  }
];

const CATEGORY_COLORS: Record<string, string> = {
  fraude: "bg-red-100 text-red-800 border-red-200",
  infraestrutura: "bg-orange-100 text-orange-800 border-orange-200",
  uso: "bg-green-100 text-green-800 border-green-200",
  acesso: "bg-blue-100 text-blue-800 border-blue-200",
  cadastral: "bg-purple-100 text-purple-800 border-purple-200",
};

export function RespostaDefesaManager() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Dados de entrada do usuário
  const [defesaAI, setDefesaAI] = useState("");
  const [motivoIndeferimento, setMotivoIndeferimento] = useState("");

  const [generatedText, setGeneratedText] = useState("");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"idle" | "generated">("idle");
  const [reviewMode, setReviewMode] = useState<"preview" | "edit">("preview");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Estados da Calculadora de Prazos
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcPrazo, setCalcPrazo] = useState<string>("15");
  const [calcCustomPrazo, setCalcCustomPrazo] = useState<string>("");
  const [calcDataInicial, setCalcDataInicial] = useState<string>("");

  const durationNum = calcPrazo === "X" ? parseInt(calcCustomPrazo || "0", 10) : parseInt(calcPrazo, 10);
  const calcDataFinal = calculateEndDate(calcDataInicial, durationNum);

  // Permite selecionar apenas UM código por vez.
  const toggleCode = (code: string) => {
    setSelectedCodes((prev) => (prev.includes(code) ? [] : [code]));
  };

  const selectedItems = DEFESAS_TEMPLATES.filter((c) => selectedCodes.includes(c.code));

  const filteredCodes = DEFESAS_TEMPLATES.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.code.toLowerCase().includes(searchLower) ||
      item.title.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  });

  const camposObrigatoriosVazios = !defesaAI.trim();

  const handleGenerate = () => {
    if (selectedItems.length === 0) return;
    if (camposObrigatoriosVazios) {
      alert("Por favor, preencha o Nº da Defesa A.I.");
      return;
    }

    const finalTexts = selectedItems.map((item) => {
      let result = item.text.replace(/{DEFESA_AI}/g, defesaAI);

      if (motivoIndeferimento.trim() !== "") {
        result = result.replace(
          /\[descrever aqui o fundamento específico para a decisão\]/g,
          motivoIndeferimento
        );
      }
      return result;
    });

    setGeneratedText(finalTexts.join("\n\n---------------------------\n\n"));
    setStep("generated");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWord = async () => {
    try {
      const response = await fetch("https://notificacao-caj.vercel.app/api/exportar_parecer_word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto_final: generatedText,
          protocolo: defesaAI,
          autoInfracao: "",
          matricula: "",
        }),
      });

      if (!response.ok) throw new Error("Erro ao gerar Word.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Resposta_Defesa_${new Date().toISOString().split("T")[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar o arquivo Word pelo servidor.");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("https://notificacao-caj.vercel.app/api/exportar_parecer_pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto_final: generatedText,
          protocolo: defesaAI,
          autoInfracao: "",
          matricula: "",
        }),
      });

      if (!response.ok) throw new Error("Erro ao gerar PDF.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Resposta_Defesa_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar o arquivo PDF. Verifique se a rota no back-end já foi criada.");
    }
  };

  return (
    <div className="h-full flex flex-col">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-[#1a5fa8]" />
            <h1 className="text-[#0b1e35] font-semibold text-lg">Redigir Resposta de Defesa</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Módulo de respostas baseadas em infrações</p>
        </div>

        {/* BOTÃO DA CALCULADORA */}
        <div className="relative">
          <button
            onClick={() => setShowCalculator((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
              showCalculator
                ? "bg-[#eef6ff] border-[#1a5fa8] text-[#1a5fa8]"
                : "bg-white border-[#1a5fa8] text-[#1a5fa8] hover:bg-[#eef6ff] shadow-sm"
            }`}
          >
            <Calculator size={16} />
            Calculadora de Dias Úteis
          </button>

          {/* MODAL: CALCULADORA DE DIAS ÚTEIS */}
          {showCalculator && (
            <div className="absolute top-full right-0 mt-3 w-full sm:min-w-[380px] max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden origin-top-right z-50 animate-slideUp">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator size={18} className="text-[#1a5fa8]" />
                  <h2 className="text-[#0b1e35] font-bold text-sm">Calculadora de Dias Úteis</h2>
                </div>
                <button onClick={() => setShowCalculator(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Data Inicial</label>
                  <DatePicker value={calcDataInicial} onChange={setCalcDataInicial} placeholder="DD/MM/AAAA" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Prazo de Resposta</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={calcPrazo}
                      onChange={(e) => setCalcPrazo(e.target.value)}
                      className="col-span-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:outline-none focus:border-[#1a5fa8] transition-all"
                    >
                      <option value="15">15 dias úteis</option>
                      <option value="30">30 dias úteis</option>
                      <option value="45">45 dias úteis</option>
                      <option value="60">60 dias úteis</option>
                      <option value="90">90 dias úteis</option>
                      <option value="X">X dias úteis (Personalizar)</option>
                    </select>

                    {calcPrazo === "X" && (
                      <input
                        type="number"
                        min="1"
                        value={calcCustomPrazo}
                        onChange={(e) => setCalcCustomPrazo(e.target.value)}
                        placeholder="Qtd. dias"
                        className="col-span-2 w-full px-3 py-2 border border-[#1a5fa8] rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a5fa8]"
                      />
                    )}
                  </div>
                </div>

                <div className="bg-[#f8fafe] border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Data Final Calculada:</span>
                  <span className={`text-sm font-bold ${calcDataFinal ? "text-[#1a5fa8]" : "text-gray-400"}`}>
                    {calcDataFinal || "--/--/----"}
                  </span>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={() => setShowCalculator(false)} className="px-5 py-2 bg-[#1a5fa8] text-white text-xs font-bold rounded-lg hover:bg-[#154d8a] transition-all">
                  Entendido
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto space-y-6">

          {/* Bloco 1 — Seleção de Códigos */}
          <SectionBlock
            number={1}
            title="Seleção de Códigos de Infração"
            description="Selecione um ou mais códigos referentes ao caso do cliente"
          >
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-[#1a5fa8] hover:bg-[#f0f7ff] transition-all"
              >
                <span className="text-gray-500">
                  {selectedCodes.length === 0
                    ? "Clique para selecionar códigos de infração..."
                    : `${selectedCodes.length} código(s) selecionado(s)`}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Pesquisar por código, título ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] focus:ring-1 focus:ring-[#1a5fa8] transition-all"
                      />
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {filteredCodes.length > 0 ? (
                      filteredCodes.map((item) => {
                        const selected = selectedCodes.includes(item.code);
                        return (
                          <button
                            key={item.code}
                            onClick={() => toggleCode(item.code)}
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[#f0f7ff] transition-colors ${selected ? "bg-[#f0f7ff]" : ""}`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selected ? "bg-[#1a5fa8] border-[#1a5fa8]" : "border-gray-300"}`}>
                              {selected && <CheckCircle2 size={10} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono font-bold text-[#1a5fa8]">{item.code}</span>
                                <span className="text-sm font-medium text-gray-800">{item.title}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium capitalize ${CATEGORY_COLORS[item.category]}`}>
                                  {item.category}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center text-sm text-gray-500">Nenhum código encontrado.</div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                      onClick={() => setDropdownOpen(false)}
                      className="px-4 py-1.5 bg-[#1a5fa8] text-white text-xs rounded-lg hover:bg-[#154d8a] transition-colors"
                    >
                      Confirmar Seleção
                    </button>
                  </div>
                </div>
              )}
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedItems.map((item) => (
                  <div key={item.code} className="flex items-center gap-1.5 bg-[#eef6ff] border border-[#c3ddf8] rounded-lg px-2.5 py-1.5">
                    <span className="text-xs font-mono font-bold text-[#1a5fa8]">{item.code}</span>
                    <span className="text-xs text-[#0b1e35]">{item.title}</span>
                    <button onClick={() => toggleCode(item.code)} className="text-[#4a7fa5] hover:text-red-500 transition-colors ml-0.5">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {(selectedCodes.length === 0 || camposObrigatoriosVazios) && (
              <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertCircle size={13} className="flex-shrink-0" />
                <p className="text-xs">
                  {selectedCodes.length === 0
                    ? "Selecione ao menos um código de infração para habilitar a geração de defesa."
                    : "Preencha o Nº da Defesa A.I. para prosseguir."}
                </p>
              </div>
            )}
          </SectionBlock>

          {/* Bloco 2 — Dados da Notificação */}
          <SectionBlock
            number={2}
            title="Dados da Notificação"
            description="Preencha os dados necessários para embasar a defesa"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Defesa A.I. nº <span className="text-red-500">*</span>
                </label>
                <input
                  value={defesaAI}
                  onChange={(e) => setDefesaAI(e.target.value)}
                  placeholder="Ex: 12345678"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Motivo do Indeferimento</label>
                <textarea
                  value={motivoIndeferimento}
                  onChange={(e) => setMotivoIndeferimento(e.target.value)}
                  placeholder="Descreva o fundamento específico para a decisão. Ex: 'A constatação em campo não condiz com as alegações do morador...'"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a5fa8] transition-all resize-y"
                />
                <p className="text-[10px] text-gray-400 mt-1">Este texto substituirá automaticamente a marcação de 'motivo de indeferimento' na minuta final.</p>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={selectedCodes.length === 0 || camposObrigatoriosVazios}
              className="w-full mt-2 flex items-center justify-center gap-3 py-3.5 px-6 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:shadow-none"
            >
              <FileText size={18} />
              Gerar Texto da Defesa
            </button>
          </SectionBlock>

          {/* Bloco 3 — Revisão e Edição (AGORA USANDO O SECTIONBLOCK!) */}
          {step === "generated" && (
            <SectionBlock
              number={3}
              title="Revisão e Edição do Texto"
              description='Preencha os campos "XXX" e ajuste qualquer detalhe necessário.'
              className="animate-fadeIn"
              headerAction={
                <div className="flex items-center gap-3 w-full justify-between md:justify-end mt-3 md:mt-0">
                  <span className="hidden md:inline-block text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full font-medium">
                    Pronto para edição!
                  </span>
                  <button
                    onClick={() => setReviewMode(reviewMode === "preview" ? "edit" : "preview")}
                    className="flex items-center gap-1.5 py-1.5 px-3 border border-gray-300 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all bg-white"
                  >
                    {reviewMode === "preview" ? "Editar Texto" : "Modo Visualização"}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 py-1.5 px-3 border border-[#1a5fa8] text-[#1a5fa8] rounded-lg text-xs font-semibold hover:bg-[#eef6ff] transition-all bg-white"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-emerald-600">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copiar Texto
                      </>
                    )}
                  </button>
                </div>
              }
            >
              {reviewMode === "preview" ? (
                <div
                  onClick={() => setReviewMode("edit")}
                  className="w-full min-h-96 p-4 bg-[#fafbfc] border border-gray-200 rounded-lg text-xs text-gray-800 leading-relaxed whitespace-pre-wrap cursor-text hover:border-[#1a5fa8]/40 transition-all"
                >
                  {generatedText}
                </div>
              ) : (
                <textarea
                  ref={textAreaRef}
                  autoFocus
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  onBlur={() => setReviewMode("preview")}
                  className="w-full h-96 p-4 bg-[#fafbfc] border border-gray-200 rounded-lg text-xs text-gray-800 font-mono leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all"
                  spellCheck={false}
                />
              )}
            </SectionBlock>
          )}

          {/* Bloco 4 — Exportação */}
          {step === "generated" && (
            <SectionBlock 
              number={4} 
              title="Exportação e Entrega" 
              description="Baixe o arquivo de resposta formatado em PDF ou Word" 
              className="animate-fadeIn"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 px-5 border-2 border-red-600 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all"
                >
                  <FileText size={17} />
                  Baixar em PDF
                </button>

                <button
                  onClick={handleDownloadWord}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 px-5 bg-[#0b1e35] hover:bg-[#071527] text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                >
                  <Download size={17} />
                  Baixar .docx
                </button>
              </div>
            </SectionBlock>
          )}
        </div>
      </div>
    </div>
  );
}