import React, {useState, useEffect} from "react";
import { useLoaderData } from "react-router-dom";
// import PokemonDetail from './PokemonDetail';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Button, CardActionArea } from "@mui/material";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import poke from '../assets/pokeball.png'
import Item from '@mui/material/ListItem'
import Pagination from "@mui/material/Pagination";
import Box from '@mui/material/Box'
import axios from 'axios'


export default function PokemonView() {
  const data = useLoaderData();
  // console.log(data)

  // selecting how many pokemon per page and creating the state
  const pokemonPerPage = 20;
  const [currentPage, setCurrentPage] = useState(data.slice(0, pokemonPerPage)) 

  // this sets the page 
  const handleClick = (event, page) => {
    const startIndex = (page - 1) * pokemonPerPage
    setCurrentPage(data.slice(startIndex, startIndex + pokemonPerPage))
  }
  
  // scrolling to top of the page by new render of pokemon
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentPage])

  // const [pokemonSprites, setPokemonSprites] = useState([])
    
  // data.forEach( async (pok) => {
  //   await axios.get(`https://pokeapi.co/api/v2/pokemon/${pok.id}`)
  //   .then(res=> setPokemonSprites(res.data.sprites))
  //   .catch(err => console.log(err))

  // })

  // useEffect(() => {
  //     for(let i = 1; i <= 809; i++) {
  //         const url = `https://pokeapi.co/api/v2/pokemon/${i}`
  //         axios.get(url)
  //         .then(res => setPokemonSprites(res.data.sprites))
  //         .catch(err => console.log(err))
  //       }
  // }, [])

  // console.log(pokemonSprites)
  return (
    <>
      <Container >
        <Grid container spacing={2} columns={12}>
      {currentPage.map((pok) => (
        <Grid item xs={6} lg={3} md={6} key={pok.id}>
          <Item  >
        <Card className='card' >
          <CardActionArea>
            <CardMedia
            className="media"
              component="img"
              height="100"
              image={`${poke}`}
              alt="to come"
            />
            <CardContent>
              <Typography gutterBottom  component="div" >
                {pok.name.english}
              </Typography>
              <Typography variant="body2" color="text.secondary">
              {pok.type[0]} {pok.type[1] ? `/ ${pok.type[1]}` : null}
              </Typography>
            </CardContent>
          </CardActionArea>
          <Button size="small" color="primary">
            PokeInfo
          </Button>
        </Card>
        </Item>
        </Grid>
      ))}
      </Grid>
      

      </Container>
      <Box className='pagination-box'>
      <Pagination
        count={Math.ceil(data.length / pokemonPerPage)}
        color='primary'
        onChange={handleClick}
      />
      </Box>
      </>
  );
}
