import React from "react";
import { useLoaderData } from "react-router-dom";
// import PokemonDetail from './PokemonDetail';
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Button, CardActionArea, CardActions } from "@mui/material";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import poke from '../assets/pokeball.png'
import Item from '@mui/material/ListItem'
import Pagination from "@mui/material/Pagination";
import usePagination from '@mui/material/usePagination';

export default function PokemonView() {
  const data = useLoaderData();
  //
  console.log(data)

  return (
    <>
      <Container>
        <Grid container md={12} sm={12}>
      {data.map((pok) => (
        <Grid xs={12} sm={6} md={4} lg={3} >
          <Item>
        <Card key={pok.id}>
          <CardActionArea>
            <CardMedia
              component="img"
              height="100"
              image={`${poke}`}
              alt="to come"
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                <a href={`/pokemon/${pok.id}`}>{pok.name.english}</a>
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
      <Pagination count={10} variant="outlined" />
      </>
  );
}
