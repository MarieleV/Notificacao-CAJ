import { createHashRouter } from "react-router"; 
import { Layout } from "../components/Layout";
import { CalculadoraMulta } from "../pages/CalculadoraMulta";
import { RedatorNotificacao } from "../pages/RedatorNotificacao";
import { ProcessoOuvidoria } from "../pages/ProcessoOuvidoria";
import { RespostaDefesa } from "../pages/RespostaDefesa";
import { ControleAnalises } from "../pages/ControleAnalises"; // <-- Importação da nova tela
import { Pagina404 } from "../pages/Pagina404";


export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: RedatorNotificacao },
      { path: "multas", Component: CalculadoraMulta },
      { path: "ouvidoria", Component: ProcessoOuvidoria },
      { path: "resposta-defesa", Component: RespostaDefesa },
      { path: "controle-analises", Component: ControleAnalises }, // <-- Rota da nova tela adicionada aqui
      { path: "*", Component: Pagina404 }, // O 404 catch-all precisa ser sempre o último
    ],
  },
]);