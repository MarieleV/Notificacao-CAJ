import { createBrowserRouter } from "react-router"; // Caso esteja na web, o pacote correto costuma ser react-router-dom
import { Layout } from "../components/layout/Layout";
import { CalculadoraMulta } from "../pages/calculadora/CalculadoraMulta";
import { RedatorNotificacao } from "../pages/notificacao/RedatorNotificacao";
import { ProcessoOuvidoria } from "../pages/ouvidoria/ProcessoOuvidoria";
import { RespostaDefesa } from "../pages/defesa/RespostaDefesa";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: RedatorNotificacao },
      { path: "multas", Component: CalculadoraMulta },
      { path: "ouvidoria", Component: ProcessoOuvidoria },
      { path: "resposta-defesa", Component: RespostaDefesa },
    ],
  },
]);