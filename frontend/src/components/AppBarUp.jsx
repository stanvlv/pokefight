import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import pokemonLogo from "../assets/pokemonfoto.png";
import { Link } from 'react-router-dom';

function AppBarUp() {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <img src={`${pokemonLogo}`} style={{ height: "2rem", left: "0", marginRight: "3rem"}} />
        <Link to="/">
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 400,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Home
          </Typography>
          </Link>
          <Link to="/pokemon">
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/pokemon"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 400,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Pokemon
          </Typography>
          </Link>
            <Link to='/fight'>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/pokemon"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 400,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Fight
          </Typography>
          </Link>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default AppBarUp;
