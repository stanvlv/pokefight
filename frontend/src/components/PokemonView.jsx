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
import axios from "axios";
import { useAtom, atom, useAtomValue } from "jotai";
import { pokemonsAtom, pokemonsAtomsAtom, filteredPokemonsAtom, paginatedAtom } from "../atoms/pokemons";
import TextField from '@mui/material/TextField'
import { splitAtom } from "jotai/utils";

export default function PokemonView() {
  // const [data, setData] = useAtom(pokemonsAtom);
  // data is now an array of atoms that each contain a pokemon
  // const data = useLoaderData();
  // console.log(data)

 
  // selecting how many pokemon per page and creating the state
  const pokemonPerPage = 20;
  const [pageNumber, setPageNumber] = useState(1);
  // const [currentPage, setCurrentPage] = useState(data.slice(0, pokemonPerPage));
  // let [currentPage, setCurrentPage] = useAtom(currentPageAtom);
  // console.log(currentPage);

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

  const [data, setData] = useAtom(currentPageAtom);

  const handleSearchSubmit = (e) => {
    e.preventDefault()
  }
  
  // this sets the page
  const handleClick = (event, page) => {
    setPageNumber(page);
    // const startIndex = (page - 1) * pokemonPerPage;
    // setCurrentPage(data.slice(startIndex, startIndex + pokemonPerPage));
    // currentPageAtom = focusAtom(pokemonsAtom, (optic) => {
    //   console. log(optic);
    //   return optic.slice(startIndex, startIndex + pokemonPerPage)
    // });
    // // does this work?
    // [currentPage, setCurrentPage] = useAtom(currentPageAtom);
  };

  // scrolling to top of the page by new render of pokemon
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageNumber]);

  useEffect(() => {
    let active = true;

    const newPagePromises = data.map(async (pokemon) => {
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
          // setCurrentPage(newPage);
          setData(newPage);
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
  }, [currentPageAtom]);

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
          {data.map((pok) => (
            <Grid item xs={6} lg={3} md={6} key={pok.id}>
                <Card className="card" style={{ maxWidth: 175 }}>
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
          count={pageCount}
          color="primary"
          onChange={handleClick}
        />
      </Box>
    </div>
    </>
  );
}
