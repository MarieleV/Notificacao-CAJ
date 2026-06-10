import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { NotificationDrafter } from "./components/NotificationDrafter";
import { FineCalculator } from "./components/FineCalculator";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: NotificationDrafter },
      { path: "multas", Component: FineCalculator },
    ],
  },
]);
