import { createBrowserRouter } from "react-router";
import { MapView } from "./components/MapView";
import { DashboardView } from "./components/DashboardView";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: MapView },
      { path: "dashboard", Component: DashboardView },
    ],
  },
]);
