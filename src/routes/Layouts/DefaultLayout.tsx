import React from "react";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router";
import { Header } from "../../components/Header/Header";
import s from "./Layouts.module.scss";

export function DefaultLayout(): JSX.Element {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export function EmptyLayout(): JSX.Element {
  return <Outlet />;
}
