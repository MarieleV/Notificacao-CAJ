import { createHashRouter } from "react-router";
import { Layout } from "../components/Layout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { CalculadoraMulta } from "../pages/CalculadoraMulta";
import { RedatorNotificacao } from "../pages/RedatorNotificacao";
import { ProcessoOuvidoria } from "../pages/ProcessoOuvidoria";
import { RespostaDefesa } from "../pages/RespostaDefesa";
import { ControleAnalises } from "../pages/ControleAnalises";
import { Pagina404 } from "../pages/Pagina404";
import { Login } from "../pages/Login";


export const router = createHashRouter([
  // Rota pública
  { path: "/login", Component: Login },

  // Rotas protegidas: exigem login
  {
    Component: ProtectedRoute,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, Component: RedatorNotificacao },
          { path: "multas", Component: CalculadoraMulta },
          { path: "ouvidoria", Component: ProcessoOuvidoria },
          { path: "resposta-defesa", Component: RespostaDefesa },
          { path: "controle-analises", Component: ControleAnalises },
          { path: "*", Component: Pagina404 }, // O 404 catch-all precisa ser sempre o último
        ],
      },
    ],
  },
]);
