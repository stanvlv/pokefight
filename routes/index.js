const express = require("express");
const router = express.Router();
const pokedex = require("../pokedex.json");
const { getPokemon, getPokemonInfo } = require("../controllers/pokemon");

router.get("/", (req, res) => {
  res.send("PokeFight");
});

router
  .get("/pokemon", (req, res) => {
    res.send(pokedex);
  })
  .get("/pokemon/:id", getPokemon)
  .get("/pokemon/:id/:info", getPokemonInfo);

module.exports = router;
