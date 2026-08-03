export interface DefesaTemplate {
  code: string;
  title: string;
  text: string;
  category: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  fraude: "bg-red-100 text-red-800 border-red-200",
  infraestrutura: "bg-orange-100 text-orange-800 border-orange-200",
  uso: "bg-green-100 text-green-800 border-green-200",
  acesso: "bg-blue-100 text-blue-800 border-blue-200",
  cadastral: "bg-purple-100 text-purple-800 border-purple-200",
};

export const DEFESAS_TEMPLATES: DefesaTemplate[] = [
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

// --- NOVA PARTE: COMUNICAÇÃO COM A API ---

export interface ExportPayload {
  texto_final: string;
  protocolo: string;
  autoInfracao: string;
  matricula: string;
}

const API_URL = "https://notificacao-caj.vercel.app/api";

export const exportarParecerWord = async (payload: ExportPayload): Promise<Blob> => {
  const response = await fetch(`${API_URL}/exportar_parecer_word`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error("Erro ao gerar Word no servidor.");
  }
  
  return response.blob();
};

export const exportarParecerPDF = async (payload: ExportPayload): Promise<Blob> => {
  const response = await fetch(`${API_URL}/exportar_parecer_pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    throw new Error("Erro ao gerar PDF no servidor.");
  }
  
  return response.blob();
};