import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
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
import { useAtom, atom, useAtomValue, useStore } from "jotai";
import { filteredPokemonsAtom, paginatedAtom, } from "../atoms/pokemons";
import TextField from '@mui/material/TextField';

function PokemonCard({ pokemonAtom }) {
  // pok.sprites is loadable, so we need to use the currentStore to get the value
  const pokemon = useAtomValue(pokemonAtom);
  const sprites = useAtomValue(pokemon.sprites);
  // The sprites themselves are stored in sprites.data
  // sprites.state can be "hasData", "hasError", or "loading"
  return (
    <Card className="card" sx={{ maxWidth: 175 }}>
      <CardActionArea>
        <CardMedia
          className="media"
          component="img"
          image={sprites.state === "hasData" ? sprites.data.front_default : `${poke}`}
          alt="to come"
        />
        <CardContent className="card-text">
          <Typography gutterBottom component="div">
            {pokemon.name.english}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pokemon.type[0]} {pokemon.type[1] ? `/ ${pokemon.type[1]}` : null}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Link
        to={`/pokemon/${pokemon.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Button size="small" color="info" className="button-text">
          Click for pokemon stats
        </Button>
      </Link>
    </Card>
  );
}

export default function PokemonView() {
  // selecting how many pokemon per page and creating the state
  const pokemonPerPage = 20;
  const [pageNumber, setPageNumber] = useState(1);

  // this will take the input and save it in search value
  //then it filters the pokemons from the currentpage
  const [searchValue, setSearchValue] = useState('');

  const filteredAtom = useMemo(() => {
    return filteredPokemonsAtom(searchValue);
  }, [searchValue]);

  const pageSizeAtom = useMemo(() => {
    return atom((get) => {
      const filtered = get(filteredAtom);
      return Math.ceil(filtered.length / pokemonPerPage);
    });
  }, [filteredAtom])
  const pageCount = useAtomValue(pageSizeAtom);

  const currentPageAtom = useMemo(() => {
    return paginatedAtom({page: pageNumber, pageSize: pokemonPerPage, paginateMe: filteredAtom});
  }, [pageNumber, filteredAtom]);

  const [data,] = useAtom(currentPageAtom);
  const currentStore = useStore();

  const handleSearchSubmit = (e) => {
    e.preventDefault()
  }
  
  // this sets the page
  const handleClick = (event, page) => {
    setPageNumber(page);
  };

  // scrolling to top of the page by new render of pokemon
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageNumber]);

  return (
    <>
    <form onSubmit={handleSearchSubmit} className="form-search">
    <TextField
    label="Search for a Pokemon"
    variant="outlined"
    value={searchValue}
    onChange={e => { setSearchValue(e.target.value); setPageNumber(1); }}
  />
  <Button type="submit" variant="contained" color="primary">Search</Button>
  </form>
    <div style={{ minHeight: "calc(100vh - 64px)"}}>
        <Grid container spacing={2} columns={12}>
          {data.map((pokAtom) => (
            <Grid item xs={6} lg={3} md={6} key={currentStore.get(pokAtom).id}>
              <PokemonCard pokemonAtom={pokAtom} />
            </Grid>
          ))}
        </Grid>
      <Box className="pagination-box">
        <Pagination
          count={pageCount}
          color="primary"
          onChange={handleClick}
        />
      </Box>
    </div>
    </>
  );
}
