import React, { useState, useEffect } from "react";
import { useLoaderData, Link } from "react-router-dom";
// import PokemonDetail from './PokemonDetail';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Button, CardActionArea } from "@mui/material";
import Grid from "@mui/material/Grid";
import poke from "../assets/pokeball.png";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import axios from "axios";

export default function PokemonView() {
  const data = useLoaderData();
  // console.log(data)

  // selecting how many pokemon per page and creating the state
  const pokemonPerPage = 20;
  const [currentPage, setCurrentPage] = useState(data.slice(0, pokemonPerPage));
  const [pageNumber, setPageNumber] = useState(1);

  // this sets the page
  const handleClick = (event, page) => {
    setPageNumber(page);
    const startIndex = (page - 1) * pokemonPerPage;
    setCurrentPage(data.slice(startIndex, startIndex + pokemonPerPage));
  };

  // scrolling to top of the page by new render of pokemon
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    let active = true;

    const newPagePromises = currentPage.map(async (pokemon) => {
      const res = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
      );
      return {
        ...pokemon,
        sprites: res.data.sprites,
      };
    });

    Promise.all(newPagePromises)
      .then((newPage) => {
        if (active) {
          console.log("updated current page with ", newPage);
          setCurrentPage(newPage);
        } else {
          console.log("active page changed, ignoring...");
        }
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      active = false;
    };
  }, [pageNumber]);

  return (
    <>
        <Grid container spacing={2} columns={12}>
          {currentPage.map((pok) => (
            <Grid item xs={6} lg={3} md={6} key={pok.id}>
                <Card className="card">
                  <CardActionArea>
                    <CardMedia
                      className="media"
                      component="img"
                      image={pok.sprites?.front_default || `${poke}`}
                      alt="to come"
                    />
                    <CardContent className="card-text">
                      <Typography gutterBottom component="div">
                        {pok.name.english}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {pok.type[0]} {pok.type[1] ? `/ ${pok.type[1]}` : null}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <Link
                    to={`/pokemon/${pok.id}`}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    <Button size="small" color="info" className="button-text">
                      Click for pokemon stats
                    </Button>
                  </Link>
                </Card>
            </Grid>
          ))}
        </Grid>
      <Box className="pagination-box">
        <Pagination
          count={Math.ceil(data.length / pokemonPerPage)}
          color="primary"
          onChange={handleClick}
        />
      </Box>
    </>
  );
}
