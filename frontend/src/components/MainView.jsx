import React from "react";
import AppBarDown from "./AppBarDown";
import AppBarUp from "./AppBarUp";
import { NavLink, Outlet } from 'react-router-dom'
import { Container } from '@mui/system'

export default function MainView() {
  return (
    <div>
       <AppBarUp />
      <Container >
        <Outlet />
      </Container>
        <AppBarDown />
    </div>
  );
}
