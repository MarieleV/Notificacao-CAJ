import { RouterProvider } from "react-router";
import { router } from "./routes/routes";

export default function App() {
  return <RouterProvider router={router} />;
}
