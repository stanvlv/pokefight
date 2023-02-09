const express = require("express");
const router = express.Router();
const pokedex = require("../pokedex.json");
const {
  getPokemons,
  getPokemon,
  getPokemonInfo,
} = require("../controllers/pokemon");
const {
  getUsers,
  getUser,
  createUser,
  updateUsers,
} = require("../controllers/users");

router.get("/", (req, res) => {
  res.send("hey");
});

router.get("/leaderboard", getUsers).get("/leaderboard/:nickname", getUser);

router.post("/users", createUser);
router.put("/users/fight", updateUsers);

router
  .get("/pokemon", getPokemons)
  .get("/pokemon/:id", getPokemon)
  .get("/pokemon/:id/:info", getPokemonInfo);

module.exports = router;
