import React from "react";
import { RouteObject, useRoutes } from "react-router";
import CarsPage from "./Cars/CarsPage";
import IndexPage from "./IndexPage/IndexPage";
import { DefaultLayout } from "./Layouts/DefaultLayout";
import SnakePage from "./Snake/SnakePage";

export const Routes: RouteObject[] = [
  {
    path: "/",
    element: <DefaultLayout />,
    children: [{ index: true, element: <IndexPage /> }],
  },
  {
    path: "/cars",
    element: <DefaultLayout />,
    children: [{ index: true, element: <CarsPage /> }],
  },
  {
    path: "/snake",
    element: <DefaultLayout />,
    children: [{ index: true, element: <SnakePage /> }],
  },
];

function AppRoutes(): JSX.Element {
  const element = useRoutes(Routes);
  return <>{element}</>;
}

export default AppRoutes;
