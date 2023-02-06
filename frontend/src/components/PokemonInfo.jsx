import React, { useState, useEffect } from "react";
import { useLoaderData, Link } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import pokeball from "../assets/pokeball.png";
import axios from "axios";

export default function PokemonInfo() {
  const data = useLoaderData();
  // const navigate = useNavigate();
  const [pokemonInfo, setPokemonInfo] = useState([]);

  useEffect(() => {
    // axios.get(`https://pokeapi.co/api/v2/pokemon/${data.name.english.toLowerCase()}`)
    axios
      .get(`https://pokeapi.co/api/v2/pokemon/${data.id}`)
      .then((res) => setPokemonInfo(res.data))
      .catch((err) => console.error(err));
  }, []);

  console.log(pokemonInfo);
  return (
    <div>
      <Container>
        <h3>This is {data.name.english}</h3>
        <h4>or also known as: Japanese - {data.name.japanese} / Chinese - {data.name.chinese} / French - {data.name.french}</h4>
        <Grid container className="poke-info" columns={12}>
          <Card sx={{ maxWidth: 345 }} className="card">
            <CardActionArea>
              <CardMedia
                className="media"
                component="img"
                height="200"
                width="auto"
                image={pokemonInfo.sprites?.front_default || `${pokeball}`}
                alt="green iguana"
              />
              <CardContent className="card-text">
                <Typography variant="body2" color="text.secondary">
                  {data.type.join(", ")}
                </Typography>
                <Typography>
                  Base State:
                  <ul>
                    <li>HP: {data.base.HP}</li>
                    <li>Attack: {data.base.Attack}</li>
                    <li>Defense: {data.base.Defense}</li>
                    <li>Speed: {data.base.Speed}</li>
                    <li>Special attack: {data.base["Sp. Attack"]}</li>
                    <li>Special defence: {data.base["Sp. Defense"]}</li>
                  </ul>
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Link to="/pokemon">
          <Button variant="contained" color="primary" className="back-button">
            back
          </Button>
        </Link>
      </Container>
    </div>
  );
}
