// Templates de resposta às defesas (Retorno de Defesa).
//
// Fonte única dos códigos (PA-10): a lista de códigos, os títulos e as categorias vêm
// de INFRACTION_CODES (notificacoes.ts), a mesma do Redigir Notificação. Aqui fica só o
// texto da defesa de cada código. Todo código do Redator precisa ter um texto aqui: se
// faltar, o TypeScript acusa erro no build (Record<CodigoInfracao, string>).
//
// O modelo "Prazo" (prorrogação de padronização) não é um código de infração e aparece
// no fim da lista.
//
// Valores das multas (R$ XXX,XX), datas (XX/XX/XXXX) e o inciso do modelo "Prazo"
// ($$$$$$$$$$$) são preenchidos pelo funcionário que faz o cálculo.
import { INFRACTION_CODES, type CodigoInfracao } from "./notificacoes";

export interface DefesaTemplate {
  code: string;
  title: string;
  text: string;
  category: string;
}

const TEXTOS_DEFESA: Record<CodigoInfracao, string> = {
  "20400":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso I, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em intervenção nas instalações dos sistemas públicos de abastecimento de água e esgotamento sanitário, quando estas possam afetar a eficiência dos serviços, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por intervenção nas instalações dos sistemas públicos de abastecimento de água e esgotamento sanitário que possam afetar a eficiência dos serviços, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20401":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XIII, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em desperdício de água em períodos oficiais de racionamento, quando estas possam afetar a eficiência dos serviços, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por Desperdício de água em períodos oficiais de racionamento, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20402":
    `Defesa A.I. nº {DEFESA_AI}
A defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.
Conforme o Art. 144, inciso XV, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em violação do lacre de proteção do cavalete, sujeitando-se à penalidade de multa.
Motivo do indeferimento: [descrever aqui o fundamento específico para a decisão]. Entretanto, caso usuário padronize a ligação de água dentro do prazo de 90 (noventa) dias, contados a partir da data de recebimento do Auto de Infração, não será aplicado multa.
Quando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.
Penalidades mantidas:

- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;

- Multa por violação do lacre de proteção do cavalete, no valor de R$ XXX,XX;

- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20402 HD":
    `Defesa A.I. nº {DEFESA_AI}
A defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.
Conforme o Art. 144, inciso XV, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em violação do lacre do hidrômetro, sujeitando-se à penalidade de multa.
Motivo do indeferimento: [descrever aqui o fundamento específico para a decisão]. Entretanto, caso usuário padronize a ligação de água dentro do prazo de 90 (noventa) dias, contados a partir da data de recebimento do Auto de Infração, não será aplicado multa.
Quando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.
Penalidades mantidas:

- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;

- Multa por violação do lacre do hidrômetro, no valor de R$ XXX,XX;

- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20403":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XXII, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em restabelecimento irregular do abastecimento de água em ligações cortadas no ramal, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por restabelecimento irregular do abastecimento de água em ligações cortadas no ramal, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20404":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso VII, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em ligação clandestina de água e esgoto, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nPenalidades mantidas:\n\n- Multa por ligação clandestina de água e esgoto, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20405":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso VI, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em danificação propositada, inversão ou supressão do hidrômetro, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por danificação propositada, inversão ou supressão do hidrômetro, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20406":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XXI, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em Intervenção no cavalete sem o consentimento do prestador de serviços, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa pela infração cometida, juntamente com a multa por não padronização.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por intervenção no cavalete sem o consentimento do prestador de serviços no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20407":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso II, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em instalação hidráulica predial de água ligada à rede pública e interligada com abastecimento de água alimentada por outras fontes, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por instalação hidráulica predial de água ligada à rede pública e interligada com abastecimento de água alimentada por outras fontes, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20408":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XI, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em interligação de instalações prediais de água, entre imóveis distintos com ou sem débito, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa interligação de instalações prediais de água, entre imóveis distintos com ou sem débito, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20409":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso VIII, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em instalação de bomba ou quaisquer dispositivos no ramal predial ou na rede de distribuição, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa instalação de bomba ou quaisquer dispositivos no ramal predial ou na rede de distribuição, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20410":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme a Resolução nº 19/2019 da ARIS, em seu Art. 69, toda unidade usuária deverá assegurar ao prestador de serviços o livre acesso para instalação, vistoria, manutenção, corte e leitura.\nNos termos do Art. 144, inciso XII, da mesma resolução, constitui infração o impedimento voluntário à promoção da leitura do hidrômetro ou à execução de serviços de manutenção do cavalete, hidrômetro e caixa de inspeção de esgoto pela prestadora de serviços.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nFica estabelecido que, caso o usuário realize a padronização da ligação de água dentro do prazo estipulado no auto de infração, não haverá aplicação da multa. Contudo, caso não cumpra a obrigatoriedade de padronização, serão aplicadas as seguintes penalidades:\nPenalidades mantidas:\n\n- Multa por impedimento voluntário: R$ XXX,XX;\n\n- Multa por não execução da padronização obrigatória: R$ XXX,XX.`,
  "20411":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XXI, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em Intervenção e/ou deslocamento de ramal/cavalete sem o consentimento do prestador de serviços, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por intervenção e/ou deslocamento de ramal/cavalete sem o consentimento do prestador de serviços, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20412":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XVI, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em utilização indevida do hidrante instalado na área interna do imóvel, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por utilização indevida do hidrante instalado na área interna do imóvel, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20413":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XIX, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em instalação de aparelhos supressores de ar, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa instalação de aparelhos supressores de ar, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20414":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso V, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em derivação do ramal predial antes do hidrômetro (by pass), sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por derivação do ramal predial antes do hidrômetro (by pass), no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20415":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XVIII, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em ausência de abrigo ou caixa de proteção do cavalete e hidrômetro, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por ausência de abrigo ou caixa de proteção do cavalete e hidrômetro, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20416":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso X, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em estabelecimento irregular do abastecimento de água em ligações cortadas no cavalete, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nPenalidades mantidas:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa restabelecimento irregular do abastecimento de água em ligações cortadas no cavalete, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20417":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme a Resolução nº 19/2019 da ARIS, em seu Art. 69, toda unidade usuária deverá assegurar ao prestador de serviços o livre acesso para instalação, vistoria, manutenção, corte e leitura.\nNos termos do Art. 144, inciso XII, da mesma resolução, constitui infração o impedimento involuntário à promoção da leitura do hidrômetro ou à execução de serviços de manutenção do cavalete, hidrômetro e caixa de inspeção de esgoto pela prestadora de serviços.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nQuando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.\nFica estabelecido que, caso o usuário realize a padronização da ligação de água dentro do prazo estipulado no auto de infração, não haverá aplicação da multa. Contudo, caso não cumpra a obrigatoriedade de padronização, serão aplicadas as seguintes penalidades:\nPenalidades mantidas:\n\n- Multa por impedimento involuntário: R$ XXX,XX;\n\n- Multa por não execução da padronização obrigatória: R$ XXX,XX.`,
  "20418":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.\nConforme o Art. 144, inciso XV, da Resolução nº 019/2019 da ARIS, constitui infração a prática decorrente de ação ou omissão do usuário que resulte em violação do lacre da porta caixa ou cubículo de proteção do hidrômetro, sujeitando-se à penalidade de multa.\nMotivo do indeferimento: [descrever aqui o fundamento específico para a decisão].\nPenalidades mantidas:\n\n- Multa Violação do lacre da porta caixa ou cubículo de proteção do hidrômetro, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  "20011":
    `Defesa A.I. nº {DEFESA_AI}
A defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.
Conforme a Resolução nº 19/2019 da ARIS, em seu Art. 69, toda unidade usuária deverá assegurar ao prestador de serviços o livre acesso para instalação, vistoria, manutenção, corte e leitura.
Nos termos do Art. 144, inciso XII, da mesma resolução, constitui infração o impedimento involuntário de acesso à ligação de água para a execução de serviços de manutenção do cavalete, hidrômetro e caixa de inspeção de esgoto pela prestadora de serviços.
Motivo do indeferimento: [descrever aqui o fundamento específico para a decisão].
Quando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.
Fica estabelecido que, caso o usuário realize a padronização da ligação de água dentro do prazo estipulado no auto de infração, não haverá aplicação da multa. Contudo, caso não cumpra a obrigatoriedade de padronização, serão aplicadas as seguintes penalidades:
Penalidades mantidas:

- Multa por impedimento involuntário: R$ XXX,XX;

- Multa por não execução da padronização obrigatória: R$ XXX,XX.`,
  "20012":
    `Defesa A.I. nº {DEFESA_AI}
A defesa apresentada pelo cliente foi analisada e indeferida/deferida parcialmente.
Conforme a Resolução nº 19/2019 da ARIS, em seu Art. 69, toda unidade usuária deverá assegurar ao prestador de serviços o livre acesso para instalação, vistoria, manutenção, corte e leitura.
Nos termos do Art. 144, inciso XII, da mesma resolução, constitui infração o impedimento involuntário de acesso à ligação de água para a leitura do hidrômetro. Meses sem acesso para leitura: [INFORMAR MESES SEM ACESSO].
Motivo do indeferimento: [descrever aqui o fundamento específico para a decisão].
Quando houver solicitação de instalação de caixa padrão, deve-se observar o prazo estabelecido e informar o fim do prazo. O prazo para execução da padronização encerra-se em XX/XX/XXXX.
Fica estabelecido que, caso o usuário realize a padronização da ligação de água dentro do prazo estipulado no auto de infração, não haverá aplicação da multa. Contudo, caso não cumpra a obrigatoriedade de padronização, serão aplicadas as seguintes penalidades:
Penalidades mantidas:

- Multa por impedimento involuntário: R$ XXX,XX;

- Multa por não execução da padronização obrigatória: R$ XXX,XX.`,
  "20013":
    `Defesa A.I. nº {DEFESA_AI}
A manifestação apresentada pelo cliente sobre a Notificação para Atualização Cadastral foi analisada e indeferida/deferida parcialmente.
Conforme disposto no art. 48, inciso VI, da Norma de Referência ANA nº 11/2024, cabe ao titular do serviço público de saneamento básico estabelecer a responsabilidade dos usuários quanto à atualização cadastral, sendo dever do próprio usuário manter suas informações atualizadas junto ao Prestador de Serviços. Em razão das mudanças decorrentes da Reforma Tributária (Emenda Constitucional nº 132/2023 e Lei Complementar nº 214), a correta identificação do cliente tornou-se obrigatória.
Motivo do indeferimento: [descrever aqui o fundamento específico para a decisão].
Permanece a obrigação de providenciar a atualização cadastral junto ao Prestador de Serviços até XX/XX/XXXX. O não atendimento sujeita o usuário à multa por recusa voluntária de atualização de dados cadastrais, conforme Art. 144, inciso XXVI, da Resolução 19/2019, alterada pela Resolução 55/2026 – ARIS.`,
  "20419":
    `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e deferida parcialmente.\nConforme disposto no art. 48, inciso VI, da Norma de Referência ANA nº 11/2024, cabe ao titular do serviço público de saneamento básico estabelecer a responsabilidade dos usuários quanto à atualização cadastral, sendo dever do próprio usuário manter suas informações atualizadas junto ao Prestador de Serviços. Notificamos V.Sa. e identificamos que seu cadastro ainda não foi atualizado.\nMotivo do deferimento parcial: [descrever aqui o fundamento específico para a decisão].\nPenalidades mantidas:\n\n- Multa Recusa voluntaria de atualização de dados cadastrais, no valor de R$ 480,80;`,
};

const MODELO_PRAZO: DefesaTemplate = {
  code: "Prazo",
  title: "Impedimento para execução de serviços",
  text: `Defesa A.I. nº {DEFESA_AI}\nA defesa apresentada pelo cliente foi analisada e deferida parcialmente.\nConforme a Resolução nº 19/2019 da ARIS, Art. 144, §3º, O prestador de serviço pode solicitar a padronização obrigatória da ligação de água para qualquer infração cometida, além da aplicação de multa, se for o caso.\nNos termos do Art. 144, inciso $$$$$$$$$$$, da mesma resolução, constitui infração XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.\nMotivo do deferimento parcial: [descrever aqui o fundamento específico para a decisão].\nDiante disso, acata-se a extensão do prazo de/em XX dias para a realização da padronização da ligação, com vencimento em XX/XX/XXXX. Após esse prazo, ficará sujeita à aplicação das seguintes penalidades:\n\n- Multa por não realização da padronização obrigatória, no valor de R$ XXX,XX;\n\n- Multa por XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX, no valor de R$ XXX,XX;\n\n- Revisão de faturamento de água/esgoto, no valor de R$ XXX,XX.`,
  category: "infraestrutura",
};

export const DEFESAS_TEMPLATES: DefesaTemplate[] = [
  ...INFRACTION_CODES.map(({ code, title, category }) => ({
    code,
    title,
    category,
    text: TEXTOS_DEFESA[code],
  })),
  MODELO_PRAZO,
];
