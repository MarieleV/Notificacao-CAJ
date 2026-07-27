export interface Funcionario {
  matricula: number;
  nome: string;
}

export const FUNCIONARIOS: Funcionario[] = [
  { matricula: 769, nome: "Adriana Schons" },
  { matricula: 864, nome: "Alfredino Schaldag" },
  { matricula: 674, nome: "Anderson Vieira Marcos" },
  { matricula: 633, nome: "Angelo Linhares Pinto" },
  { matricula: 594, nome: "Artur Corsani Nishitani" },
  { matricula: 541, nome: "Bernardo Theodoro Santos Dutra" },
  { matricula: 751, nome: "Carlos Clemilton Andrade De Oliveira" },
  { matricula: 763, nome: "Cristiano Bruch" },
  { matricula: 646, nome: "Debora Evans Teixeira" },
  { matricula: 1228, nome: "Edir Lamin" },
  { matricula: 1559, nome: "Eduardo Limberger Netto" },
  { matricula: 744, nome: "Elvis Gunther Dahnert" },
  { matricula: 888, nome: "Emanuelle De Carvalho Alves" },
  { matricula: 770, nome: "Fabiano Da Silva" },
  { matricula: 861, nome: "Gilmar Fernandes Da Silveira" },
  { matricula: 1324, nome: "Glauber Antonio Fachin" },
  { matricula: 750, nome: "Jonata Da Silva" },
  { matricula: 761, nome: "Jose Moacir Fabian Junior" },
  { matricula: 827, nome: "Larissa Welter Emidio" },
  { matricula: 587, nome: "Leandro Buch" },
  { matricula: 402, nome: "Maira Fuchter" },
  { matricula: 852, nome: "Marcel Gai" },
  { matricula: 826, nome: "Marcio Monteiro Da Silva" },
  { matricula: 1674, nome: "Marcio Roberto Pereira" },
  { matricula: 635, nome: "Marcos Moises Muller" },
  { matricula: 1723, nome: "Matheus Simoes Gomes De Freitas" },
  { matricula: 522, nome: "Peroaldo De Souza Santos" },
  { matricula: 314, nome: "Valter Carlos Estephanes" },
  { matricula: 960, nome: "Vilmar Vieira De Meneses" },
];

export interface InfractionCode {
  code: string;
  title: string;
  clauseMulta: string;
  clauseMultaCP: string;
  category: string;
}

export const INFRACTION_CODES: InfractionCode[] = [
  {
    code: "20400",
    title: "Intervenção na rede e equipamentos água/esgoto da CIA",
    clauseMulta: "Descrição do fato gerador: Intervenção na rede e equipamentos água/esgoto da CIA.  Dispositivo legal infringido: Artigo 144, inciso I da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por intervenção na rede e equipamentos água, conforme Art. 144, inciso I.",
    clauseMultaCP: "Descrição do fato gerador: Intervenção na rede e equipamentos água/esgoto da CIA e ausência de caixa proteção.  Dispositivo legal infringido: Artigo 144, inciso I da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por intervenção na rede e equipamento, conforme Art. 144, inciso I. Além da multa, deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 (noventa) dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "infraestrutura",
  },
  {
    code: "20401",
    title: "Desperdício de água em períodos oficiais de racionamento",
    clauseMulta: "Descrição do fato gerador: Desperdício de água em períodos oficiais de racionamento.  Dispositivo legal infringido: Artigo 144, inciso XIII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por desperdício de água em períodos oficiais de racionamento, conforme Art. 144, inciso XIII.",
    clauseMultaCP: "Descrição do fato gerador: Desperdício de água em períodos oficiais de racionamento.  Dispositivo legal infringido: Artigo 144, inciso XIII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por desperdício de água em períodos oficiais de racionamento, conforme Art. 144, inciso XIII. Além da multa, deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 (noventa) dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "uso",
  },
  {
    code: "20402",
    title: "Violação do lacre cavalete",
    clauseMulta: "Descrição do fato gerador: Violação do lacre cavalete.  Dispositivo legal infringido: Artigo 144, inciso XV da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por violação do lacre cavalete. Entretanto, caso usuário padronize a ligação de água dentro do prazo de 90 (noventa) dias úteis, contados a partir da data de recebimento do Auto de Infração, não será aplicado multa.",
    clauseMultaCP: "Descrição do fato gerador: Violação do lacre cavalete.  Dispositivo legal infringido: Artigo 144, inciso XV da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por violação do lacre cavalete. Entretanto, caso usuário padronize a ligação de água dentro do prazo de 90 (noventa) dias úteis, contados a partir da data de recebimento do Auto de Infração, não será aplicado multa.",
    category: "fraude",
  },
  {
    code: "20402 HD",
    title: "Violação do lacre do hidrômetro",
    clauseMulta: "Descrição do fato gerador: Violação do lacre do hidrômetro.  Dispositivo legal infringido: Artigo 144, inciso XV da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por violação do lacre do hidrômetro. Caso seja feita a padronização da ligação em até 90 dias, não será aplicado multa.",
    clauseMultaCP: "Descrição do fato gerador: Violação do lacre do hidrômetro.  Dispositivo legal infringido: Artigo 144, inciso XV da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por violação do lacre do hidrômetro, conforme Art. 144, inciso XV. Além da multa, deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 (noventa) dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "fraude",
  },
  {
    code: "20403",
    title: "Violação do corte ramal",
    clauseMulta: "Descrição do fato gerador: Violação do corte ramal.  Dispositivo legal infringido: Artigo 144, inciso XXII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por violação do corte ramal, conforme Art. 144, inciso XXII.",
    clauseMultaCP: "Descrição do fato gerador: Violação do corte ramal.  Dispositivo legal infringido: Artigo 144, inciso XXII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por violação do corte ramal, conforme, 144, inciso XXII. Além da multa, deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 (noventa) dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "fraude",
  },
  {
    code: "20404",
    title: "Ligação clandestina de água e esgoto",
    clauseMulta: "Descrição do fato gerador: Ligação clandestina de água e esgoto.  Dispositivo legal infringido: Artigo 144, inciso VII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por ligação clandestina de água e esgoto, conforme Art. 144, inciso VII.",
    clauseMultaCP: "Descrição do fato gerador: Ligação clandestina de água e esgoto.  Dispositivo legal infringido: Artigo 144, inciso VII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por ligação clandestina de água e esgoto, conforme Art. 144, inciso VII.",
    category: "fraude",
  },
  {
    code: "20405",
    title: "Inversão/Danificação ou Retirada do Hidrômetro",
    clauseMulta: "Descrição do fato gerador: Inversão/Danificação ou Retirada do Hidrômetro.  Dispositivo legal infringido: Artigo 144, inciso VI da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por inversão/danificação ou retirada do hidrômetro, conforme Art. 144, inciso VI.",
    clauseMultaCP: "Descrição do fato gerador: Inversão/Danificação ou Retirada do Hidrômetro.  Dispositivo legal infringido: Artigo 144, inciso VI da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por inversão/danificação ou retirada do hidrômetro, conforme Art. 144, inciso VI. Além da multa, deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 (noventa) dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "fraude",
  },
  {
    code: "20406",
    title: "Intervenção no cavalete sem consentimento da CAJ",
    clauseMulta: "Descrição do fato gerador: Intervenção no cavalete sem consentimento da CAJ.  Dispositivo legal infringido: Artigo 144, inciso XXI da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por intervenção no cavalete sem consentimento da CAJ, conforme Art. 144, inciso XXI.",
    clauseMultaCP: "Descrição do fato gerador: Intervenção no cavalete sem consentimento da CAJ.  Dispositivo legal infringido: Artigo 144, inciso XXI da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por intervenção no cavalete sem consentimento da CAJ conforme Art. 144, inciso XXI; e obrigatoriedade de padronizar a ligação de água em 90 (noventa) dias úteis conforme Art. 144, § 3º. Entretanto, caso usuário padronize a ligação de água em 90 dias, as multas não serão aplicadas. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "infraestrutura",
  },
  {
    code: "20407",
    title: "Interligação ligação água com outra fonte alternativa",
    clauseMulta: "Descrição do fato gerador: Interligação ligação água com outra fonte alternativa.  Dispositivo legal infringido: Artigo 144, inciso II da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por interligação ligação água com outra fonte alternativa, conforme Art. 144, inciso II.",
    clauseMultaCP: "Descrição do fato gerador: Interligação ligação água com outra fonte alternativa.  Dispositivo legal infringido: Artigo 144, inciso II da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por Interligação ligação água com outra fonte alternativa, conforme Art. 144, inciso II. Além da multa deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 (noventa) dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "infraestrutura",
  },
  {
    code: "20408",
    title: "Cessão de água entre imóveis",
    clauseMulta: "Descrição do fato gerador: Cessão de água entre imóveis.  Dispositivo legal infringido: Artigo 144, inciso XI da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por cessão de água entre imóveis, conforme Art. 144, inciso XI.",
    clauseMultaCP: "Descrição do fato gerador: Cessão de água entre imóveis.  Dispositivo legal infringido: Artigo 144, inciso XI da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por cessão de água entre imóveis, conforme Art. 144, inciso XI. Além da multa deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "uso",
  },
  {
    code: "20409",
    title: "Inst. de bombas ou dispositivos na rede e/ou ramal predial",
    clauseMulta: "Descrição do fato gerador: Inst.de bombas ou dispositivos na rede e/ou ramal predial.  Dispositivo legal infringido: Artigo 144, inciso VIII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por inst. de bombas ou dispositivos no ramal ou rede de distribuição, conforme Art. 144, inciso VIII.",
    clauseMultaCP: "Descrição do fato gerador: Inst.de bombas ou dispositivos na rede e/ou ramal predial.  Dispositivo legal infringido: Artigo 144, inciso VIII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por inst. de bombas ou dispositivos no ramal ou rede de distribuição, conforme Art. 144, inciso VIII. Além da multa deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 (noventa) dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "infraestrutura",
  },
  {
    code: "20410",
    title: "Impedimento voluntário de acesso à ligação de água e esgoto",
    clauseMulta: "Descrição do fato gerador: Impedimento voluntário de acesso a ligação de água e esgoto.  Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por impedimento voluntário de acesso a ligação de água e esgoto, conforme Art. 144, inciso XII.",
    clauseMultaCP: "Descrição do fato gerador: Impedimento voluntário de acesso a ligação de água e esgoto.  Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por impedimento voluntário de acesso a ligação de água e esgoto, conforme Art. 144, inciso XII. Além da multa deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "acesso",
  },
  {
    code: "20411",
    title: "Intervenção no ramal e/ou deslocamento s/consentimento",
    clauseMulta: "Descrição do fato gerador: Intervenção no ramal e/ou deslocamento de ramal/cavalete s/consentimento.  Dispositivo legal infringido: Artigo 144, inciso XXI da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por intervenção no ramal e/ou deslocamento de ramal/cavalete s/consentimento, conforme Art. 144, inciso XXI.",
    clauseMultaCP: "Descrição do fato gerador: Intervenção no ramal e/ou deslocamento de ramal/cavalete s/consentimento.  Dispositivo legal infringido: Artigo 144, inciso XXI da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por intervenção no ramal e/ou deslocamento de ramal/cavalete s/consentimento, conforme Art. 144, inciso XXI. Além da multa deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "infraestrutura",
  },
  {
    code: "20412",
    title: "Utilização indevida do hidrante instalado no imóvel",
    clauseMulta: "Descrição do fato gerador: Utilização indevida do hidrante instalado no imóvel.  Dispositivo legal infringido: Artigo 144, inciso XVI da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por utilização indevida do hidrante instalado no imóvel, conforme Art. 144, inciso XVI.",
    clauseMultaCP: "Descrição do fato gerador: Utilização indevida do hidrante instalado no imóvel.  Dispositivo legal infringido: Artigo 144, inciso XVI da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por utilização indevida do hidrante instalado no imóvel, conforme Art. 144, inciso XVI. Além da multa deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 (noventa) dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "uso",
  },
  {
    code: "20413",
    title: "Instalação de aparelhos supressores de ar",
    clauseMulta: "Descrição do fato gerador: Instalação de aparelhos supressores de ar.  Dispositivo legal infringido: Artigo 144, inciso XIX da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por instalação de aparelhos supressores de ar, conforme Art. 144, inciso XIX.",
    clauseMultaCP: "Descrição do fato gerador: Instalação de aparelhos supressores de ar.  Dispositivo legal infringido: Artigo 144, inciso XIX da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por instalação de aparelhos supressores de ar, conforme Art. 144, inciso XIX. Além da multa deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 (noventa) dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "infraestrutura",
  },
  {
    code: "20414",
    title: "Derivação não autorizada antes do hidrômetro (by-pass)",
    clauseMulta: "Descrição do fato gerador: Derivação não autorizada antes do hidrômetro (by-pass).  Dispositivo legal infringido: Artigo 144, inciso V da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por derivação não autorizada antes do hidrômetro (by-pass), conforme Art. 144, inciso V.",
    clauseMultaCP: "Descrição do fato gerador: Derivação não autorizada antes do hidrômetro (by-pass).  Dispositivo legal infringido: Artigo 144, inciso V da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por derivação não autorizada antes do hidrômetro (by-pass), conforme Art. 144, inciso V. Além da multa deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 (noventa) dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "fraude",
  },
  {
    code: "20415",
    title: "Ausência de caixa de proteção do cavalete e hidrômetro",
    clauseMulta: "Descrição do fato gerador: Ausência de caixa de proteção do cavalete e hidrômetro.  Dispositivo legal infringido: Artigo 144, inciso XVIII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por ausência de caixa de proteção do cavalete e hidrômetro, conforme Art. 144, inciso XVIII.",
    clauseMultaCP: "Descrição do fato gerador: Ausência de caixa de proteção do cavalete e hidrômetro.  Dispositivo legal infringido: Artigo 144, inciso XVIII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por ausência de caixa de proteção do cavalete e hidrômetro, conforme Art. 144, inciso XVIII. Além da multa deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "infraestrutura",
  },
  {
    code: "20416",
    title: "Violação do corte cavalete",
    clauseMulta: "Descrição do fato gerador: Violação do corte cavalete.  Dispositivo legal infringido: Artigo 144, inciso X da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por violação do corte cavalete, conforme Art. 144, inciso X.",
    clauseMultaCP: "Descrição do fato gerador: Violação do corte cavalete.  Dispositivo legal infringido: Artigo 144, inciso X da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por violação do corte cavalete, conforme Art. 144, inciso X. Além da multa deverá providenciar a padronização obrigatória da ligação de água com inst. de caixa padrão em 90 (noventa) dias úteis, conforme Art. 144, § 3º. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "fraude",
  },
  {
    code: "20417",
    title: "Impedimento involuntário de acesso à ligação de água e esgoto",
    clauseMulta: "Descrição do fato gerador: Impedimento involuntário de acesso a ligação de água e esgoto.  Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por impedimento involuntário de acesso a ligação de água e esgoto, conforme Art. 144, inciso XII.",
    clauseMultaCP: "Descrição do fato gerador: Impedimento involuntário de acesso a ligação de água e esgoto.  Dispositivo legal infringido: Artigo 144, inciso XII da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por impedimento involuntário de acesso a ligação de água e esgoto, conforme Art. 144, inciso XII; e obrigatoriedade de padronizar a ligação de água em 90 (noventa) dias úteis conforme Art. 144, § 3º. Entretanto, caso usuário padronize a ligação de água em 90 dias úteis, as multas não serão aplicadas. Caso usuário não atenda à obrigatoriedade de padronização, será aplicado multa por não padronização, juntamente com a multa pela infração cometida.",
    category: "acesso",
  },
  {
    code: "20418",
    title: "Violação do lacre da porta caixa ou cubículo de proteção do hidrômetro",
    clauseMulta: "Descrição do fato gerador: Violação do lacre da porta caixa ou cubículo de proteção do hidrômetro.  Dispositivo legal infringido: Artigo 144, inciso XIV da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por violação do lacre da porta caixa ou cubículo de proteção do hidrômetro, conforme Art. 144, inciso XIV.",
    clauseMultaCP: "Descrição do fato gerador: Violação do lacre da porta caixa ou cubículo de proteção do hidrômetro.  Dispositivo legal infringido: Artigo 144, inciso XIV da Resolução 019/2019 - ARIS.  Data da constatação:  Protocolo:  Funcionário:  Equipe:  Penalidade prevista: Multa por violação do lacre da porta caixa ou cubículo de proteção do hidrômetro, conforme Art. 144, inciso XIV.",
    category: "fraude",
  },
  {
    code: "20013",
    title: "Notificação para Atualização Cadastral",
    clauseMulta: "NOTIFICAÇÃO PARA ATUALIZAÇÃO CADASTRAL  Prezado(a) cliente,  Conforme Comunicado Extra emitido junto à sua fatura, para atualização cadastral, identificamos que seu cadastro ainda não foi atualizado.  Em razão das mudanças decorrentes da Reforma Tributária (Emenda Constitucional nº 132/2023 e Lei Complementar nº 214), a correta identificação do cliente tornou-se obrigatória.  Conforme disposto no art. 48, inciso VI, da Norma de Referência ANA nº 11/2024, cabe ao titular do serviço público de saneamento básico estabelecer a responsabilidade dos usuários quanto à atualização cadastral, sendo dever do próprio usuário manter suas informações atualizadas junto ao Prestador de Serviços.  Notificamos V.Sa. para que no prazo de 15 dias úteis, a partir do recebimento desta notificação, providencie a atualização cadastral junto ao Prestador de Serviços.",
    clauseMultaCP: "NOTIFICAÇÃO PARA ATUALIZAÇÃO CADASTRAL  Prezado(a) cliente,  Conforme Comunicado Extra emitido junto à sua fatura, para atualização cadastral, identificamos que seu cadastro ainda não foi atualizado.  Em razão das mudanças decorrentes da Reforma Tributária (Emenda Constitucional nº 132/2023 e Lei Complementar nº 214), a correta identificação do cliente tornou-se obrigatória.  Conforme disposto no art. 48, inciso VI, da Norma de Referência ANA nº 11/2024, cabe ao titular do serviço público de saneamento básico estabelecer a responsabilidade dos usuários quanto à atualização cadastral, sendo dever do próprio usuário manter suas informações atualizadas junto ao Prestador de Serviços.  Notificamos V.Sa. para que no prazo de 15 dias úteis, a partir do recebimento desta notificação, providencie a atualização cadastral junto ao Prestador de Serviços.",
    category: "cadastral",
  },
  {
    code: "20419",
    title: "Recusa voluntária de atualização de dados cadastrais",
    clauseMulta: "Descrição do fato gerador: Inércia do usuário em atender à solicitação formal da Companhia Águas de Joinville para atualização ou complementação de dados cadastrais obrigatórios, conforme Comunicado Extra enviado junto com a Fatura xx/2025  Data do Comunicado Extra: Data de Leitura   Equipe: Leiturista/Fimm  Penalidade prevista: Multa por Recusa voluntaria de atualização de dados cadastrais.",
    clauseMultaCP: "Descrição do fato gerador: Inércia do usuário em atender à solicitação formal da Companhia Águas de Joinville para atualização ou complementação de dados cadastrais obrigatórios, conforme Comunicado Extra enviado junto com a Fatura xx/2025  Data do Comunicado Extra: Data de Leitura   Equipe: Leiturista/Fimm  Penalidade prevista: Multa por Recusa voluntaria de atualização de dados cadastrais.",
    category: "cadastral",
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  fraude: "bg-red-100 text-red-800 border-red-200",
  infraestrutura: "bg-orange-100 text-orange-800 border-orange-200",
  uso: "bg-green-100 text-green-800 border-green-200",
  acesso: "bg-blue-100 text-blue-800 border-blue-200",
  cadastral: "bg-purple-100 text-purple-800 border-purple-200",
};