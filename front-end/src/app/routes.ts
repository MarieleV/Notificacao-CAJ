import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { NotificationDrafter } from "./components/NotificationDrafter";
import { RespostaDefesaManager } from "./components/RespostaDefesaManager";
import { FineCalculator } from "./components/FineCalculator";
import { OuvidoriaManager } from "./components/OuvidoriaManager";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: NotificationDrafter },
      { path: "multas", Component: FineCalculator },
      { path: "ouvidoria", Component: OuvidoriaManager },
      { path: "resposta-defesa", Component: RespostaDefesaManager },
    ],
  },
]);