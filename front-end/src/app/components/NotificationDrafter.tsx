import { useState, useRef } from "react";
import {
  Sparkles, Copy, Download, CheckCircle2, AlertCircle,
  ChevronDown, X, FileText, Loader2, Info, Key, Search,
} from "lucide-react";

const INFRACTION_CODES = [
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

const CATEGORY_COLORS: Record<string, string> = {
  fraude: "bg-red-100 text-red-800 border-red-200",
  infraestrutura: "bg-orange-100 text-orange-800 border-orange-200",
  uso: "bg-green-100 text-green-800 border-green-200",
  acesso: "bg-blue-100 text-blue-800 border-blue-200",
  cadastral: "bg-purple-100 text-purple-800 border-purple-200",
};

type PenaltyVariant = "multa" | "multaCP";

export function NotificationDrafter() {
  const [apiKey, setApiKey] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // <-- ADICIONE ESTA LINHA
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"idle" | "generated">("idle");
  const [penaltyVariant, setPenaltyVariant] = useState<PenaltyVariant>("multa");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const toggleCode = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const selectedItems = INFRACTION_CODES.filter((c) =>
    selectedCodes.includes(c.code)
  );

  // <-- BLOCO INTEIRO ADICIONADO PARA FILTRAGEM
  const filteredCodes = INFRACTION_CODES.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.code.toLowerCase().includes(searchLower) ||
      item.title.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  });
  // ------------------------------------

  const handleGenerate = async () => {
    if (selectedItems.length === 0) return;
    if (!apiKey) {
      alert("Por favor, insira sua Chave de API do Gemini no topo da tela.");
      return;
    }

    setLoading(true);
    setStep("idle");

    const textosBase = selectedItems.map(item => 
      penaltyVariant === "multaCP" ? item.clauseMultaCP : item.clauseMulta
    );

    try {
      const response = await fetch("https://notificacao-caj-5jfs-ofaqozlvg-marieles-projects-ec100d86.vercel.app/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          textos_base: textosBase
        }),
      });

      if (!response.ok) throw new Error("Erro na comunicação com o servidor Python");
      
      const data = await response.json();
      setGeneratedText(data.texto_gerado);
      setStep("generated");
    } catch (error) {
      console.error(error);
      alert("Falha ao gerar o documento. Verifique se o servidor está funcionando corretamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch("https://notificacao-caj-5jfs-ofaqozlvg-marieles-projects-ec100d86.vercel.app/api/exportar_word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto_final: generatedText }),
      });

      if (!response.ok) throw new Error("Erro ao gerar Word.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Notificacao_Extrajudicial_${new Date().toISOString().split("T")[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Erro ao baixar o arquivo Word pelo servidor.");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#1a5fa8]" />
            <h1 className="text-[#0b1e35] font-semibold text-lg">Redigir Notificação Extrajudicial</h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Assistente de redação jurídica com Inteligência Artificial</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus-within:border-[#1a5fa8] transition-colors">
            <Key size={14} className="text-gray-400 mr-2" />
            <input 
              type="password" 
              placeholder="Gemini API Key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm text-gray-700 w-48"
            />
          </div>
          <div className="flex items-center gap-2 bg-[#eef6ff] border border-[#c3ddf8] rounded-lg px-3 py-1.5">
            <Sparkles size={13} className="text-[#1a5fa8]" />
            <span className="text-[#1a5fa8] text-xs font-medium">Powered by Python & Gemini</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto space-y-6">

          {/* Step 1 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
              <div>
                <h2 className="text-[#0b1e35] font-semibold text-sm">Seleção de Códigos de Infração</h2>
                <p className="text-gray-500 text-xs">Selecione um ou mais códigos referentes ao caso do cliente</p>
              </div>
            </div>
            <div className="p-6">
              {/* Dropdown trigger */}
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
                    {/* <-- ADICIONE O BLOCO DA BARRA DE PESQUISA AQUI --> */}
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
                    {/* <------------------------------------------------> */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-500 px-2">Clique para selecionar/desmarcar</p>
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
                                <p className="text-xs text-gray-500 mt-1 truncate">{item.clauseMulta.substring(0, 90)}…</p>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-sm text-gray-500">
                          Nenhum código encontrado para "{searchTerm}".
                        </div>
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

              {/* Selected tags */}
              {selectedItems.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedItems.map((item) => (
                    <div
                      key={item.code}
                      className="flex items-center gap-1.5 bg-[#eef6ff] border border-[#c3ddf8] rounded-lg px-2.5 py-1.5"
                    >
                      <span className="text-xs font-mono font-bold text-[#1a5fa8]">{item.code}</span>
                      <span className="text-xs text-[#0b1e35]">{item.title}</span>
                      <button
                        onClick={() => toggleCode(item.code)}
                        className="text-[#4a7fa5] hover:text-red-500 transition-colors ml-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Penalty variant selector */}
              <div className="mt-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <Info size={12} className="text-gray-400" />
                  <p className="text-xs text-gray-400 font-medium">Tipo de penalidade a aplicar</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPenaltyVariant("multa")}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                      penaltyVariant === "multa"
                        ? "border-[#1a5fa8] bg-[#eef6ff] text-[#1a5fa8]"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    Apenas Multa
                  </button>
                  <button
                    onClick={() => setPenaltyVariant("multaCP")}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                      penaltyVariant === "multaCP"
                        ? "border-[#1a5fa8] bg-[#eef6ff] text-[#1a5fa8]"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    Multa + Cumprimento de Padronização
                  </button>
                </div>
              </div>

              {/* Clause preview */}
              {selectedItems.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Info size={12} className="text-gray-400" />
                    <p className="text-xs text-gray-400 font-medium">Prévia das cláusulas selecionadas</p>
                  </div>
                  <div className="bg-[#f8fafe] border border-[#dce9f7] rounded-lg p-3 space-y-2 max-h-32 overflow-y-auto">
                    {selectedItems.map((item) => (
                      <div key={item.code} className="text-xs text-gray-600 leading-relaxed">
                        <span className="font-bold text-[#1a5fa8]">[{item.code}]</span>{" "}
                        {penaltyVariant === "multaCP" ? item.clauseMultaCP : item.clauseMulta}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2 — Generate */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
              <div>
                <h2 className="text-[#0b1e35] font-semibold text-sm">Geração com Inteligência Artificial</h2>
                <p className="text-gray-500 text-xs">Redige a notificação formal em um clique</p>
              </div>
            </div>
            <div className="p-6">
              <button
                onClick={handleGenerate}
                disabled={selectedCodes.length === 0 || loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-[#1a5fa8] hover:bg-[#154d8a] disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    IA processando — redigindo notificação…
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Consolidar e Redigir Texto
                  </>
                )}
              </button>
              {selectedCodes.length === 0 && (
                <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertCircle size={13} />
                  <p className="text-xs">Selecione ao menos um código de infração para habilitar a geração</p>
                </div>
              )}
            </div>
          </div>

          {/* Step 3 — Edit */}
          {step === "generated" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={13} />
                  </span>
                  <div>
                    <h2 className="text-[#0b1e35] font-semibold text-sm">Revisão e Edição do Texto</h2>
                    <p className="text-gray-500 text-xs">Clique no texto para personalizar — nome, datas, número do contrato</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-full font-medium">
                  Gerado com sucesso
                </span>
              </div>
              <div className="p-6">
                <textarea
                  ref={textAreaRef}
                  value={generatedText}
                  onChange={(e) => setGeneratedText(e.target.value)}
                  className="w-full h-96 p-4 bg-[#fafbfc] border border-gray-200 rounded-lg text-xs text-gray-800 font-mono leading-relaxed resize-none focus:outline-none focus:border-[#1a5fa8] focus:ring-2 focus:ring-[#1a5fa8]/10 transition-all"
                  spellCheck={false}
                />
                <div className="mt-2 flex items-center gap-1.5 text-gray-400">
                  <Info size={11} />
                  <p className="text-[11px]">Substitua os campos vazios com os dados reais do caso</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Export */}
          {step === "generated" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1a5fa8] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>
                <div>
                  <h2 className="text-[#0b1e35] font-semibold text-sm">Exportação e Entrega</h2>
                  <p className="text-gray-500 text-xs">Copie para a área de transferência ou baixe o arquivo Word formatado</p>
                </div>
              </div>
              <div className="p-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 px-5 border-2 border-[#1a5fa8] text-[#1a5fa8] rounded-xl font-semibold text-sm hover:bg-[#eef6ff] transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={17} className="text-emerald-500" />
                      <span className="text-emerald-600">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={17} />
                      Copiar Texto
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 px-5 bg-[#0b1e35] hover:bg-[#071527] text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                >
                  <Download size={17} />
                  Baixar .docx (ABNT/Jurídico)
                </button>
              </div>
              <div className="px-6 pb-4">
                <div className="bg-[#f8fafe] border border-[#dce9f7] rounded-lg px-3 py-2 flex items-start gap-2">
                  <Info size={13} className="text-[#4a7fa5] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#4a7fa5]">
                    O arquivo Word é gerado com margens 3×2cm, espaçamento 1.5, fonte Arial 12 e texto justificado, nos padrões ABNT/Jurídico — pronto para impressão ou assinatura digital.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}