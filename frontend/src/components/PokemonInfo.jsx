import React, {useState, useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import { Container, Grid, Card, CardActionArea, CardMedia, CardContent, Typography, Button, CardActions } from "@mui/material";
import pokeball from '../assets/pokeball.png'
import axios from 'axios'

export default function PokemonInfo() {
  const data = useLoaderData();

  const [pokemonInfo, setPokemonInfo] = useState()

  useEffect(() => {
    // axios.get(`https://pokeapi.co/api/v2/pokemon/${data.name.english.toLowerCase()}`)
    axios.get(`https://pokeapi.co/api/v2/pokemon/${data.id}`)
    .then(res => setPokemonInfo(res.data.sprites))
    .catch(err => console.error(err))
  }, [])

  console.log(pokemonInfo);
  return (
    <div>
      <Container>
        <Grid>
        <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={`${pokeball}`}
          alt="green iguana"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
          {data.name.english}
          </Typography>
          <Typography variant="body2" color="text.secondary">
          {data.type.join(", ")}
          </Typography>
          <Typography>
            Base State:
            <ul>
            <li>HP: {data.base.HP}</li>
            <li>Attack: {data.base.Attack}</li>
            <li>Defence: {data.base.Defense}</li>
            <li>Speed: {data.base.Speed}</li>
            <li>Special attack: {data.base["Sp. Attack"]}</li>
            <li>Special defence: {data.base["Sp. Defense"]}</li>
            </ul>
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary">
          Share
        </Button>
      </CardActions>
    </Card>
          <p></p>
          <a href="/">back</a>
        </Grid>
      </Container>
    </div>
  );
}
