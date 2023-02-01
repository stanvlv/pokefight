import React from "react";
import { Outlet } from "react-router-dom";
import AppBarDown from "./AppBarDown";
import AppBarUp from "./AppBarUp";

export default function MainView() {
  return (
    <div>
      <AppBarUp />
      <Outlet />
      <AppBarDown />
    </div>
  );
}
