const pokedex = require("../pokedex.json");

const getPokemon = (req, res) => {
  const { id } = req.params;
  const pokemon = pokedex.find((poke) => poke.id === parseInt(id));
  if (!pokemon) {
    return res.status(404).send("Pokemon not found");
  }
  res.send(pokemon);
};

const getPokemonInfo = (req, res) => {
  const { id, info } = req.params;
  const pokemon = pokedex.find((poke) => poke.id === parseInt(id));
  if (!pokemon) {
    return res.status(404).send("Pokemon not found");
  }
  if (info === "name") {
    res.send(pokemon.name);
  } else if (info === "type") {
    res.send(pokemon.type);
  } else if (info === "base") {
    res.send(pokemon.base);
  } else {
    res.status(400).send("Sorry mate");
  }
};

module.exports = {
  getPokemon,
  getPokemonInfo,
};