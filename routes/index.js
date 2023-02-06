const express = require("express");
const router = express.Router();
const pokedex = require("../pokedex.json");
const { getPokemon, getPokemonInfo } = require("../controllers/pokemon");
const Pokemon = require('../database').Pokemon

router.get("/", (req, res) => {
  res.send("hey")
});

router
  .get("/pokemon", async (req, res) => {
    const pokemon = await Pokemon.find({})
    res.send(pokemon);
  })
  .get("/pokemon/:id", getPokemon)
  .get("/pokemon/:id/:info", getPokemonInfo);

module.exports = router;
