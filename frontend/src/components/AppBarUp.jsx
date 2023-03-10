import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import pokemonLogo from "../assets/pokemonfoto.png";
import { Link } from 'react-router-dom';

function AppBarUp() {
  return (
    <AppBar position="static" style={{marginBottom: "2rem"}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <img src={`${pokemonLogo}`} style={{ height: "2rem", left: "0", marginRight: "3rem"}} />
        <Link to="/" className="nav-link" >
          <Typography
            variant="h7"
            noWrap
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
          <Link to="/pokemon" className="nav-link">
          <Typography
            variant="h7"
            noWrap
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
           {">"} Pokemon
          </Typography>
          </Link>
            <Link to='/fight' className="nav-link">
          <Typography
            variant="h7"
            noWrap
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
           {">"} Fight
          </Typography>
          </Link>
          <Link to='/leaderboard' className="nav-link">
          <Typography
            variant="h7"
            noWrap
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
            {">"} Leaderboard
          </Typography>
          </Link>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default AppBarUp;
